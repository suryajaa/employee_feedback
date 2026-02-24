from sqlalchemy import create_engine, Column, String, Boolean, Integer, LargeBinary
from sqlalchemy.orm import declarative_base, sessionmaker
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./secureview.db")

# PostgreSQL fix — Railway gives a URL starting with postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True, index=True)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    department = Column(String, nullable=False)
    has_submitted = Column(Boolean, default=False)

class DepartmentState(Base):
    __tablename__ = "department_states"
    department = Column(String, primary_key=True, index=True)
    client_count = Column(Integer, default=0)
    round_complete = Column(Boolean, default=False)
    aggregated_embedding = Column(LargeBinary, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()