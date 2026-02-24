from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import numpy as np

from embedding import generate_embedding
from fl_aggregation import load_department_state, save_department_state, reset_department_state
from insights import generate_insights
from auth.auth_routes import router as auth_router
from auth.dependencies import get_current_user
from database import init_db, get_db, User

EMBEDDING_DIM = 384
MAX_EMPLOYEES_PER_DEPT = 20

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router, prefix="/auth")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FeedbackRequest(BaseModel):
    department: str
    feedback_text: str


@app.post("/feedback/submit")
def submit_feedback(
    payload: FeedbackRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Only employees can submit feedback")

    if payload.department != user["department"]:
        raise HTTPException(status_code=403, detail="Department mismatch")

    # ✅ Check if already submitted this cycle
    db_user = db.query(User).filter(User.email == user["email"]).first()
    if db_user.has_submitted:
        raise HTTPException(status_code=403, detail="Already submitted this cycle")

    dept_state = load_department_state(
        department=user["department"],
        embedding_dim=EMBEDDING_DIM,
        max_clients=MAX_EMPLOYEES_PER_DEPT,
        db=db
    )

    if not dept_state.can_accept_feedback():
        raise HTTPException(status_code=400, detail="Feedback limit reached")

    embedding = np.array(generate_embedding(payload.feedback_text))
    dept_state.add_client_embedding(embedding)

    # ✅ Persist aggregated state
    save_department_state(user["department"], dept_state, db)

    # ✅ Mark employee as submitted
    db_user.has_submitted = True
    db.commit()

    del payload.feedback_text
    del embedding

    return {
        "message": "Feedback aggregated successfully",
        "submitted_count": dept_state.client_count
    }


@app.get("/manager/insights/{department}")
def get_department_insights(
    department: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view insights")

    if department != user["department"]:
        raise HTTPException(status_code=403, detail="Access denied")

    dept_state = load_department_state(
        department=department,
        embedding_dim=EMBEDDING_DIM,
        max_clients=MAX_EMPLOYEES_PER_DEPT,
        db=db
    )

    if dept_state.client_count == 0:
        raise HTTPException(status_code=404, detail="No feedback yet")

    insights = generate_insights(dept_state.aggregated_embedding.tolist())

    return {
        "department": department,
        "num_employees": dept_state.client_count,
        "max_employees": MAX_EMPLOYEES_PER_DEPT,
        "status": "CLOSED" if dept_state.round_complete else "OPEN",
        "insights": insights
    }


@app.post("/admin/reset/{department}")
def reset_cycle(
    department: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can reset cycles")

    if department != user["department"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Reset aggregated state
    reset_department_state(department, db)

    # Reset all employees in this department
    db.query(User).filter(
        User.department == department,
        User.role == "employee"
    ).update({"has_submitted": False})
    db.commit()

    return {"message": f"New feedback cycle started for {department}"}