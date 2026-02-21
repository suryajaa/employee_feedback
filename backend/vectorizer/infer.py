import torch
from encoder import FeedbackEncoder
from head import FeedbackVectorHead

LABELS = [
    "teamwork",
    "communication",
    "support",
    "efficiency",
    "adaptability",
    "performance"
]

class FeedbackVectorizer:
    def __init__(self):
        self.encoder = FeedbackEncoder()
        self.head = FeedbackVectorHead()

    def vectorize(self, responses: dict):
        texts = list(responses.values())

        embeddings = self.encoder.encode(texts)

        if len(embeddings.shape) == 2:
            embedding = embeddings.mean(axis=0)
        else:
            embedding = embeddings

        embedding_tensor = torch.tensor(embedding).float()

        with torch.no_grad():
            output = self.head(embedding_tensor)

        values = output.numpy().tolist()
        return dict(zip(LABELS, values))
