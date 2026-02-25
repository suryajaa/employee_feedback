from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import numpy as np
import os

from embedding import generate_embedding
from fl_aggregation import load_department_state, save_department_state, reset_department_state
from insights import generate_insights
from auth.auth_routes import router as auth_router
from auth.dependencies import get_current_user
from database import init_db, get_db, User

ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000"
).split(",")

EMBEDDING_DIM = 384
MAX_EMPLOYEES_PER_DEPT = 20
VALID_FORM_IDS = {"1", "2", "3"}

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(auth_router, prefix="/auth")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FeedbackRequest(BaseModel):
    department: str
    feedback_text: str
    form_id: str


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

    if payload.form_id not in VALID_FORM_IDS:
        raise HTTPException(status_code=400, detail="Invalid form ID")

    db_user = db.query(User).filter(User.email == user["email"]).first()

    # Check if already submitted this form
    submitted_field = f"submitted_form_{payload.form_id}"
    if getattr(db_user, submitted_field):
        raise HTTPException(status_code=403, detail=f"Already submitted form {payload.form_id}")

    dept_state = load_department_state(
        department=user["department"],
        form_id=payload.form_id,
        embedding_dim=EMBEDDING_DIM,
        max_clients=MAX_EMPLOYEES_PER_DEPT,
        db=db
    )

    if not dept_state.can_accept_feedback():
        raise HTTPException(status_code=400, detail="Feedback limit reached")

    embedding = np.array(generate_embedding(payload.feedback_text))
    dept_state.add_client_embedding(embedding)

    save_department_state(user["department"], payload.form_id, dept_state, db)

    setattr(db_user, submitted_field, True)
    db.commit()

    del payload.feedback_text
    del embedding

    return {
        "message": "Feedback aggregated successfully",
        "submitted_count": dept_state.client_count
    }


@app.get("/manager/insights/{department}/{form_id}")
def get_department_insights(
    department: str,
    form_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view insights")

    if department != user["department"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if form_id not in VALID_FORM_IDS:
        raise HTTPException(status_code=400, detail="Invalid form ID")

    dept_state = load_department_state(
        department=department,
        form_id=form_id,
        embedding_dim=EMBEDDING_DIM,
        max_clients=MAX_EMPLOYEES_PER_DEPT,
        db=db
    )

    if dept_state.client_count == 0:
        raise HTTPException(status_code=404, detail="No feedback yet")

    insights = generate_insights(dept_state.aggregated_embedding.tolist())

    return {
        "department": department,
        "form_id": form_id,
        "num_employees": dept_state.client_count,
        "max_employees": MAX_EMPLOYEES_PER_DEPT,
        "status": "CLOSED" if dept_state.round_complete else "OPEN",
        "insights": insights
    }


@app.get("/manager/forms/{department}")
def get_forms_overview(
    department: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view forms")

    if department != user["department"]:
        raise HTTPException(status_code=403, detail="Access denied")

    FORM_NAMES = {
        "1": "Manager Leadership Feedback",
        "2": "Team Collaboration Survey",
        "3": "Company Culture Assessment",
    }

    forms = []
    for form_id, form_name in FORM_NAMES.items():
        dept_state = load_department_state(
            department=department,
            form_id=form_id,
            embedding_dim=EMBEDDING_DIM,
            max_clients=MAX_EMPLOYEES_PER_DEPT,
            db=db
        )
        forms.append({
            "form_id": form_id,
            "form_name": form_name,
            "num_submissions": dept_state.client_count,
            "max_employees": MAX_EMPLOYEES_PER_DEPT,
            "status": "CLOSED" if dept_state.round_complete else "OPEN",
        })

    return {"department": department, "forms": forms}


@app.post("/admin/reset/{department}/{form_id}")
def reset_cycle(
    department: str,
    form_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can reset cycles")

    if department != user["department"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if form_id not in VALID_FORM_IDS:
        raise HTTPException(status_code=400, detail="Invalid form ID")

    reset_department_state(department, form_id, db)

    submitted_field = f"submitted_form_{form_id}"
    for emp in db.query(User).filter(User.department == department, User.role == "employee").all():
        setattr(emp, submitted_field, False)
    db.commit()

    return {"message": f"New feedback cycle started for form {form_id} in {department}"}