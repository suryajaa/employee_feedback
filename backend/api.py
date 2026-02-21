# api.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

from embedding import generate_embedding
from fl_aggregation import get_department_state
from insights import generate_insights
from auth.auth_routes import router as auth_router
from auth.dependencies import get_current_user

# -------------------------
# App setup
# -------------------------
app = FastAPI()
app.include_router(auth_router, prefix="/auth")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Constants
# -------------------------
EMBEDDING_DIM = 384
MAX_EMPLOYEES_PER_DEPT = 20

# -------------------------
# Request model
# -------------------------
class FeedbackRequest(BaseModel):
    department: str
    feedback_text: str

# -------------------------
# Employee submits feedback
# -------------------------
@app.post("/feedback/submit")
def submit_feedback(
    payload: FeedbackRequest,
    user=Depends(get_current_user)
):
    print("🔥 HIT /feedback/submit")

    # 🔐 Role enforcement
    if user["role"] != "employee":
        return {"error": "Only employees can submit feedback"}

    # 🔐 Department enforcement
    if payload.department != user["department"]:
        return {"error": "Department mismatch"}

    dept_state = get_department_state(
        department=user["department"],
        embedding_dim=EMBEDDING_DIM,
        max_clients=MAX_EMPLOYEES_PER_DEPT
    )

    if not dept_state.can_accept_feedback():
        return {"error": "Feedback limit reached"}

    # ✅ Generate embedding
    embedding = np.array(generate_embedding(payload.feedback_text))

    # ✅ Federated update (NO storage)
    dept_state.add_client_embedding(embedding)

    # 🔥 Destroy sensitive data
    del payload.feedback_text
    del embedding

    return {
        "message": "Feedback aggregated successfully",
        "submitted_count": dept_state.client_count
    }

# -------------------------
# Manager views insights
# -------------------------
@app.get("/manager/insights/{department}")
def get_department_insights(
    department: str,
    user=Depends(get_current_user)
):
    if user["role"] != "manager":
        return {"error": "Only managers can view insights"}

    if department != user["department"]:
        return {"error": "Access denied"}

    dept_state = get_department_state(
        department=department,
        embedding_dim=EMBEDDING_DIM,
        max_clients=MAX_EMPLOYEES_PER_DEPT
    )

    if dept_state.client_count == 0:
        return {"error": "No feedback yet"}

    insights = generate_insights(
        dept_state.aggregated_embedding.tolist()
    )

    return {
        "department": department,
        "num_employees": dept_state.client_count,
        "insights": insights
    }
