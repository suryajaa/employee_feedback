import numpy as np
from sqlalchemy.orm import Session

class DepartmentFLState:
    def __init__(self, embedding_dim: int, max_clients: int):
        self.embedding_dim = embedding_dim
        self.max_clients = max_clients
        self.client_count = 0
        self.round_complete = False
        self.aggregated_embedding = np.zeros(embedding_dim)

    def can_accept_feedback(self):
        return (
            not self.round_complete and
            self.client_count < self.max_clients
        )

    def add_client_embedding(self, embedding: np.ndarray):
        if self.round_complete:
            raise ValueError("FL round already completed")
        self.client_count += 1
        lr = 1 / self.client_count
        self.aggregated_embedding = (
            (1 - lr) * self.aggregated_embedding + lr * embedding
        )
        if self.client_count >= self.max_clients:
            self.round_complete = True

    def reset_for_next_round(self):
        self.client_count = 0
        self.round_complete = False
        self.aggregated_embedding = np.zeros(self.embedding_dim)


def _state_id(department: str, form_id: str) -> str:
    return f"{department}_{form_id}"


def load_department_state(department: str, form_id: str, embedding_dim: int, max_clients: int, db: Session) -> DepartmentFLState:
    from database import DepartmentState
    state = DepartmentFLState(embedding_dim=embedding_dim, max_clients=max_clients)
    db_row = db.query(DepartmentState).filter(
        DepartmentState.id == _state_id(department, form_id)
    ).first()
    if db_row:
        state.client_count = db_row.client_count
        state.round_complete = db_row.round_complete
        if db_row.aggregated_embedding:
            state.aggregated_embedding = np.frombuffer(db_row.aggregated_embedding, dtype=np.float64).copy()
    return state


def save_department_state(department: str, form_id: str, state: DepartmentFLState, db: Session):
    from database import DepartmentState
    sid = _state_id(department, form_id)
    db_row = db.query(DepartmentState).filter(DepartmentState.id == sid).first()
    if not db_row:
        db_row = DepartmentState(id=sid, department=department, form_id=form_id)
        db.add(db_row)
    db_row.client_count = state.client_count
    db_row.round_complete = state.round_complete
    db_row.aggregated_embedding = state.aggregated_embedding.astype(np.float64).tobytes()
    db.commit()


def reset_department_state(department: str, form_id: str, db: Session):
    from database import DepartmentState
    sid = _state_id(department, form_id)
    db_row = db.query(DepartmentState).filter(DepartmentState.id == sid).first()
    if db_row:
        db_row.client_count = 0
        db_row.round_complete = False
        db_row.aggregated_embedding = None
        db.commit()