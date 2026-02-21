import numpy as np
from typing import Dict

class DepartmentFLState:
    def __init__(self, embedding_dim: int, max_clients: int):
        self.embedding_dim = embedding_dim
        self.max_clients = max_clients

        self.round_id = 1
        self.client_count = 0
        self.round_complete = False

        self.aggregated_embedding = np.zeros(embedding_dim)

    def can_accept_feedback(self):
        return (
            not self.round_complete and
            self.client_count < self.max_clients
        )

    def add_client_embedding(self, embedding: np.ndarray):
        """
        Online Federated Averaging (no client storage)
        """
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
        """
        Starts a new FL round
        """
        self.round_id += 1
        self.client_count = 0
        self.round_complete = False
        self.aggregated_embedding = np.zeros(self.embedding_dim)


DEPARTMENT_FL_STATES: Dict[str, DepartmentFLState] = {}

def get_department_state(
    department: str,
    embedding_dim: int,
    max_clients: int
) -> DepartmentFLState:

    if department not in DEPARTMENT_FL_STATES:
        DEPARTMENT_FL_STATES[department] = DepartmentFLState(
            embedding_dim=embedding_dim,
            max_clients=max_clients
        )

    return DEPARTMENT_FL_STATES[department]
