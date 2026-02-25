from database import SessionLocal, init_db, User
from auth.auth_utils import hash_password

def seed():
    init_db()
    db = SessionLocal()

    users = [
        {"email": "admin@secureview.com", "password": "admin123", "role": "admin", "department": "none"},
        {"email": "manager@eng.com", "password": "password123", "role": "manager", "department": "engineering"},
        {"email": "employee@eng.com", "password": "password123", "role": "employee", "department": "engineering"},
    ]

    for u in users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            db.add(User(
                email=u["email"],
                password=hash_password(u["password"]),
                role=u["role"],
                department=u["department"],
                submitted_form_1=False,
                submitted_form_2=False,
                submitted_form_3=False,
            ))
            print(f"✅ Created {u['role']}: {u['email']}")
        else:
            print(f"⚠️  Already exists: {u['email']}")

    db.commit()
    db.close()

if __name__ == "__main__":
    seed()