"""
Train a booking field extraction classifier.
Uses TF-IDF + Logistic Regression — lightweight, fast, no GPU needed.

Run order:
  1. python generate_training_data.py   → creates training_data.json
  2. python train_booking_model.py      → creates app/agents/booking/booking_model.pkl
"""

import json
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import numpy as np

MODEL_PATH = "app/agents/booking/booking_model.pkl"


def train():
    print("📂 Loading training data...")
    with open("training_data.json") as f:
        data = json.load(f)

    texts = [d["text"] for d in data]
    labels = [d["label"] for d in data]

    print(f"✅ Loaded {len(texts)} examples")

    from collections import Counter
    counts = Counter(labels)
    for label, count in sorted(counts.items()):
        print(f"   {label}: {count} examples")

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=5000,
            analyzer="word",
            lowercase=True,
            strip_accents="unicode"
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=2.0,           # matches your tuning
            solver="lbfgs"
        ))
    ])

    print("\n🔧 Training model...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print("\n📈 Model Performance:")
    print(classification_report(y_test, y_pred))

    accuracy = np.mean(np.array(y_pred) == np.array(y_test))
    print(f"✅ Accuracy: {accuracy:.2%}")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)

    print(f"\n💾 Model saved to {MODEL_PATH}")

    print("\n🧪 Quick test:")
    test_phrases = [
        "i want to book 2 tickets for victoria memorial",
        "victoria memorial",
        "2 adult tickets",
        "ancient civilizations gallery",
        "can you add one more child ticket for it",
        "the upcoming saturday would work the best for me",
        "11 am",
        "finalize the booking",
        "what are the timings of shows",
        "yes confirm",
        "family of 4",
        "morning slot",
    ]
    for phrase in test_phrases:
        pred = pipeline.predict([phrase])[0]
        conf = max(pipeline.predict_proba([phrase])[0])
        print(f"   '{phrase}' → {pred} ({conf:.0%})")


if __name__ == "__main__":
    train()