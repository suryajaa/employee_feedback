from sentence_transformers import SentenceTransformer

class FeedbackEncoder:
    def __init__(self):
        self.model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

    def encode(self, texts):
        """
        texts: str or List[str]
        returns: numpy array
        """
        return self.model.encode(texts)
