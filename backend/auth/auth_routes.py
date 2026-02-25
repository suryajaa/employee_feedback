from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from auth.schemas import RegisterRequest, LoginRequest
from auth.auth_utils import hash_password, verify_password, create_access_token
from auth.dependencies import get_current_user
from database import get_db, User

router = APIRouter()

@router.post("/register")
def register_user(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can register users")
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = User(
        email=payload.email,
        password=hash_password(payload.password),
        role=payload.role,
        department=payload.department,
        submitted_form_1=False,
        submitted_form_2=False,
        submitted_form_3=False,
    )
    db.add(new_user)
    db.commit()
    return {"status": "registered"}


@router.post("/login")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({
        "email": user.email,
        "role": user.role,
        "department": user.department
    })
    return {
        "access_token": token,
        "role": user.role,
        "department": user.department,
        "submitted_form_1": user.submitted_form_1,
        "submitted_form_2": user.submitted_form_2,
        "submitted_form_3": user.submitted_form_3,
    }


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view users")
    users = db.query(User).filter(User.role != "admin").all()
    return [
        {
            "email": u.email,
            "role": u.role,
            "department": u.department,
            "submitted_form_1": u.submitted_form_1,
            "submitted_form_2": u.submitted_form_2,
            "submitted_form_3": u.submitted_form_3,
        }
        for u in users
    ]


@router.delete("/users/{email}")
def delete_user(
    email: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"status": "deleted"}