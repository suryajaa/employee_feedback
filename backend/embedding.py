# embedding.py
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

def clip_embedding(embedding: np.ndarray, max_norm: float = 1.0):
    norm = np.linalg.norm(embedding)
    if norm > max_norm:
        embedding = embedding * (max_norm / norm)
    return embedding

def add_laplace_noise(embedding: np.ndarray, epsilon: float):
    scale = 1.0 / epsilon
    noise = np.random.laplace(loc=0.0, scale=scale, size=embedding.shape)
    return embedding + noise

def generate_embedding(text: str, epsilon: float = 5.0):  # increased from 1.0
    embedding = model.encode(text)
    embedding = np.array(embedding)
    embedding = clip_embedding(embedding, max_norm=1.0)
    dp_embedding = add_laplace_noise(embedding, epsilon)
    return dp_embedding.tolist()