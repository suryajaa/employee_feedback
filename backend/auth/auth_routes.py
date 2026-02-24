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
        has_submitted=False
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
        "has_submitted": user.has_submitted
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
            "has_submitted": u.has_submitted
        }
        for u in users
    ]