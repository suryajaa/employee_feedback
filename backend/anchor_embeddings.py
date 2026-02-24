# anchor_embeddings.py
from sentence_transformers import SentenceTransformer
from anchors import INSIGHT_ANCHORS
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

ANCHOR_EMBEDDINGS = {
    key: model.encode(text).tolist()
    for key, text in INSIGHT_ANCHORS.items()
}