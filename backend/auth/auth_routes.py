from fastapi import APIRouter, HTTPException
from auth.schemas import RegisterRequest, LoginRequest
from auth.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter()

USERS_DB = {}  # email → user object

@router.post("/register")
def register_user(payload: RegisterRequest):
    if payload.email in USERS_DB:
        raise HTTPException(status_code=400, detail="User already exists")

    USERS_DB[payload.email] = {
        "email": payload.email,
        "password": hash_password(payload.password),
        "role": payload.role,
        "department": payload.department
    }

    return {"status": "registered"}

@router.post("/login")
def login_user(payload: LoginRequest):
    user = USERS_DB.get(payload.email)
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "email": user["email"],
        "role": user["role"],
        "department": user["department"]
    })

    return {
        "access_token": token,
        "role": user["role"],
        "department": user["department"]
    }
