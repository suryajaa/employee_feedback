# anchor_embeddings.py
from embedding import generate_embedding
from anchors import INSIGHT_ANCHORS

ANCHOR_EMBEDDINGS = {
    key: generate_embedding(text)
    for key, text in INSIGHT_ANCHORS.items()
}
