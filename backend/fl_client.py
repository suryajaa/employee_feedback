import torch
import numpy as np

def local_train(feedback_text: str):
    """
    Simulated local training step.
    No real model training (safe for demo).
    """

    update = torch.tensor(
        np.random.rand(10), dtype=torch.float32
    )

    noise = torch.randn_like(update) * 0.05
    dp_update = update + noise

    fake_loss = np.random.uniform(0.2, 0.6)

    print("Local training completed (simulated)")
    return dp_update, fake_loss
