from infer import FeedbackVectorizer

if __name__ == "__main__":
    feedback = {
        "Teamwork": "The team collaborates very well",
        "Communication": "Communication is clear but sometimes slow",
        "Efficiency": "Deadlines are often missed"
    }

    vectorizer = FeedbackVectorizer()
    vectors = vectorizer.vectorize(feedback)

    print(vectors)
