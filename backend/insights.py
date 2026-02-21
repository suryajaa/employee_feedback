import numpy as np
from anchor_embeddings import ANCHOR_EMBEDDINGS

# -------------------------
# Utils
# -------------------------
def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def confidence_label(score: float):
    if score >= 0.75:
        return "high"
    elif score >= 0.5:
        return "medium"
    else:
        return "low"


def explanation_text(dimension: str, score: float):
    if score >= 0.75:
        return f"Strong signals related to {dimension} are consistently present in employee feedback."
    elif score >= 0.5:
        return f"Moderate patterns related to {dimension} appear across feedback submissions."
    else:
        return f"Weak or inconsistent signals related to {dimension} were observed."


# -------------------------
# Main Insight Generator
# -------------------------
def generate_insights(aggregated_embedding):
    insights = {}

    scores = []

    for dimension, anchor_embedding in ANCHOR_EMBEDDINGS.items():
        score = cosine_similarity(aggregated_embedding, anchor_embedding)
        scores.append((dimension, score))

    # Sort dimensions by strength
    scores.sort(key=lambda x: x[1], reverse=True)

    for dimension, score in scores:
        insights[dimension] = {
            "score": round(score, 3),
            "confidence": confidence_label(score),
            "explanation": explanation_text(dimension, score)
        }

    return {
        "top_drivers": [dim for dim, _ in scores[:3]],
        "dimensions": insights
    }
