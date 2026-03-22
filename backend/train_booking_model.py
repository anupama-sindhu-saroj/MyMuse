"""
Train a booking field extraction classifier.
Uses TF-IDF + Logistic Regression — lightweight, fast, no GPU needed.

Run: python train_booking_model.py
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
    print(f"📊 Labels: {set(labels)}")

    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    # Build pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 3),      # unigrams, bigrams, trigrams
            max_features=5000,
            analyzer="word",
            lowercase=True,
            strip_accents="unicode"
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver="lbfgs"
        ))
    ])

    print("\n🔧 Training model...")
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    print("\n📈 Model Performance:")
    print(classification_report(y_test, y_pred))

    accuracy = np.mean(np.array(y_pred) == np.array(y_test))
    print(f"✅ Accuracy: {accuracy:.2%}")

    # Save model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)

    print(f"\n💾 Model saved to {MODEL_PATH}")

    # Quick test
    print("\n🧪 Quick test:")
    test_phrases = [
        "I want 2 tickets for Dinosaur Exhibit",
        "on Saturday",
        "at 2pm",
        "yes confirm",
        "hello",
        "2 adults and 1 child",
    ]
    for phrase in test_phrases:
        pred = pipeline.predict([phrase])[0]
        conf = max(pipeline.predict_proba([phrase])[0])
        print(f"   '{phrase}' → {pred} ({conf:.0%} confidence)")


if __name__ == "__main__":
    train()