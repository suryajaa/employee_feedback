import torch
import torch.nn as nn

class FeedbackVectorHead(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(384, 6)

    def forward(self, x):
        return torch.sigmoid(self.linear(x))
