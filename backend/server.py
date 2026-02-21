from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fl_client import local_train
import torch

app = FastAPI()

# ------------------- CORS setup -------------------
origins = [
    "http://localhost:3000",
    "http://192.168.1.6:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------------------------------

client_updates = []

class Feedback(BaseModel):
    feedback: str

@app.post("/submit-feedback")
def submit_feedback(data: Feedback):
    update, loss = local_train(data.feedback)
    client_updates.append(update)

    print(f"Client update received | Loss: {loss:.4f}")

    # Simulate federated aggregation
    if len(client_updates) >= 2:
        global_model = federated_average(client_updates)
        client_updates.clear()
        print("Federated aggregation completed")
        print("Global model vector:", global_model.tolist())

    return {"status": "received"}

def federated_average(updates):
    return torch.stack(updates).mean(dim=0)
