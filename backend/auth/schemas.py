from pydantic import BaseModel

class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str           # "employee" or "manager"
    department: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    role: str
    department: str
