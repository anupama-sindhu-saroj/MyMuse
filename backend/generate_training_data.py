"""
Generate training data for booking field extraction classifier.
Run: python generate_training_data.py
"""

import json
import random
from datetime import datetime, timedelta

# ── Training examples ─────────────────────────────────────────
SHOWS = [
    "General Admittance",
    "Dinosaur Exhibit",
    "Space & Cosmos Gallery",
    "Ancient Egypt",
    "Modern Art Collection"
]

DATES = []
today = datetime.now()
for i in range(1, 30):
    d = today + timedelta(days=i)
    if d.weekday() != 0:  # skip Monday
        DATES.append(d.strftime("%Y-%m-%d"))

DATE_WORDS = {
    "today": today.strftime("%Y-%m-%d"),
    "tomorrow": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
    "saturday": None,
    "sunday": None,
    "this weekend": None,
}

# Find next Saturday and Sunday
for i in range(1, 8):
    d = today + timedelta(days=i)
    if d.weekday() == 5:
        DATE_WORDS["saturday"] = d.strftime("%Y-%m-%d")
        DATE_WORDS["this weekend"] = d.strftime("%Y-%m-%d")
    if d.weekday() == 6:
        DATE_WORDS["sunday"] = d.strftime("%Y-%m-%d")

TIME_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"]
TIME_WORDS = {
    "10": "10:00 AM", "10am": "10:00 AM", "10 am": "10:00 AM", "morning": "10:00 AM",
    "12": "12:00 PM", "12pm": "12:00 PM", "noon": "12:00 PM", "afternoon": "12:00 PM",
    "2": "2:00 PM", "2pm": "2:00 PM", "2 pm": "2:00 PM",
    "4": "4:00 PM", "4pm": "4:00 PM", "4 pm": "4:00 PM", "evening": "4:00 PM"
}

def generate_examples():
    examples = []

    # ── Show extraction examples ──────────────────────────────
    for show in SHOWS:
        show_lower = show.lower()
        show_key = show_lower.split()[0]

        templates = [
            f"I want to visit {show}",
            f"Book tickets for {show}",
            f"I'm interested in {show}",
            f"Can I book {show}?",
            f"We'd like to see {show}",
            f"{show} please",
            f"I want {show}",
            f"Show me {show}",
            f"I'd like to attend {show}",
            f"Interested in {show_key} exhibit",
            f"The {show_key} one",
            f"We want to go to {show}",
            f"Book me for {show}",
            f"I want tickets to {show}",
        ]
        for t in templates:
            examples.append({
                "text": t,
                "label": "show",
                "value": show
            })

    # ── Ticket count examples ─────────────────────────────────
    ticket_templates = [
        ("1 adult ticket", {"adult": 1, "child": 0, "senior": 0}),
        ("2 adult tickets", {"adult": 2, "child": 0, "senior": 0}),
        ("3 tickets", {"adult": 3, "child": 0, "senior": 0}),
        ("4 adults", {"adult": 4, "child": 0, "senior": 0}),
        ("2 adults and 1 child", {"adult": 2, "child": 1, "senior": 0}),
        ("1 adult 2 children", {"adult": 1, "child": 2, "senior": 0}),
        ("2 adults and 1 senior", {"adult": 2, "child": 0, "senior": 1}),
        ("3 adults 2 kids", {"adult": 3, "child": 2, "senior": 0}),
        ("1 senior ticket", {"adult": 0, "child": 0, "senior": 1}),
        ("2 seniors", {"adult": 0, "child": 0, "senior": 2}),
        ("family of 4", {"adult": 2, "child": 2, "senior": 0}),
        ("just 1 ticket", {"adult": 1, "child": 0, "senior": 0}),
        ("we are 5 people", {"adult": 5, "child": 0, "senior": 0}),
        ("me and my friend", {"adult": 2, "child": 0, "senior": 0}),
        ("2 people", {"adult": 2, "child": 0, "senior": 0}),
        ("3 people", {"adult": 3, "child": 0, "senior": 0}),
        ("book for 2", {"adult": 2, "child": 0, "senior": 0}),
        ("4 tickets please", {"adult": 4, "child": 0, "senior": 0}),
        ("1 adult and 3 children", {"adult": 1, "child": 3, "senior": 0}),
        ("2 adults 2 kids 1 senior", {"adult": 2, "child": 2, "senior": 1}),
        ("5 tickets", {"adult": 5, "child": 0, "senior": 0}),
        ("6 tickets", {"adult": 6, "child": 0, "senior": 0}),
        ("just me", {"adult": 1, "child": 0, "senior": 0}),
        ("only 1", {"adult": 1, "child": 0, "senior": 0}),
        ("2 nos", {"adult": 2, "child": 0, "senior": 0}),
        ("3 nos", {"adult": 3, "child": 0, "senior": 0}),
        ("one ticket", {"adult": 1, "child": 0, "senior": 0}),
        ("two tickets", {"adult": 2, "child": 0, "senior": 0}),
        ("three tickets", {"adult": 3, "child": 0, "senior": 0}),
        ("four tickets", {"adult": 4, "child": 0, "senior": 0}),
        ("five tickets", {"adult": 5, "child": 0, "senior": 0}),
        ("need 2 tickets", {"adult": 2, "child": 0, "senior": 0}),
        ("need 3 tickets", {"adult": 3, "child": 0, "senior": 0}),
        ("want 2 tickets", {"adult": 2, "child": 0, "senior": 0}),
        ("want 4 tickets", {"adult": 4, "child": 0, "senior": 0}),
        ("book 2 tickets", {"adult": 2, "child": 0, "senior": 0}),
        ("book 3 tickets", {"adult": 3, "child": 0, "senior": 0}),
        ("get me 2 tickets", {"adult": 2, "child": 0, "senior": 0}),
        ("2 adults 1 kid", {"adult": 2, "child": 1, "senior": 0}),
        ("3 adults 2 children", {"adult": 3, "child": 2, "senior": 0}),
        ("1 adult 1 child 1 senior", {"adult": 1, "child": 1, "senior": 1}),
        ("group of 5", {"adult": 5, "child": 0, "senior": 0}),
        ("group of 10", {"adult": 10, "child": 0, "senior": 0}),
        ("couple tickets", {"adult": 2, "child": 0, "senior": 0}),
        ("tickets for 3", {"adult": 3, "child": 0, "senior": 0}),
        ("tickets for 4", {"adult": 4, "child": 0, "senior": 0}),
        ("tickets for 5", {"adult": 5, "child": 0, "senior": 0}),
        ("2 entries", {"adult": 2, "child": 0, "senior": 0}),
        ("3 passes", {"adult": 3, "child": 0, "senior": 0}),
    ]
    for text, value in ticket_templates:
        examples.append({
            "text": text,
            "label": "tickets",
            "value": json.dumps(value)
        })

    # ── Date examples ─────────────────────────────────────────
    for word, date_val in DATE_WORDS.items():
        if date_val:
            for template in [
                f"on {word}",
                f"visit {word}",
                f"I want to go {word}",
                f"booking for {word}",
                f"{word} please",
                f"can we come {word}",
            ]:
                examples.append({
                    "text": template,
                    "label": "date",
                    "value": date_val
                })

    # Random date examples
    for d in DATES[:10]:
        formatted = datetime.strptime(d, "%Y-%m-%d").strftime("%d %B")
        for template in [
            f"on {formatted}",
            f"{formatted}",
            f"visit on {formatted}",
            f"book for {formatted}",
        ]:
            examples.append({
                "text": template,
                "label": "date",
                "value": d
            })

    # ── Time slot examples ────────────────────────────────────
    for word, slot in TIME_WORDS.items():
        for template in [
            f"at {word}",
            f"{word} slot",
            f"the {word} timing",
            f"I prefer {word}",
            f"{word} please",
            f"time slot {word}",
            f"at {word} o'clock",
        ]:
            examples.append({
                "text": template,
                "label": "time_slot",
                "value": slot
            })

    # ── Confirmation examples ─────────────────────────────────
    # ── Confirmation examples ─────────────────────────────────────
    confirm_texts = [
        "yes", "confirm", "ok", "okay", "sure", "proceed",
        "book it", "go ahead", "confirmed", "yes please",
        "that's correct", "sounds good", "perfect", "great",
        "finalize", "done", "yep", "yup", "absolutely",
        "yes book it", "yes confirm please", "please confirm",
        "i confirm", "let's do it", "book now", "yes go ahead",
        "confirmed please", "yes that's right", "correct",
        "yes proceed", "ok confirm", "sure go ahead",
        "yes i confirm", "book the tickets", "finalize booking",
        "yes finalize", "ok book it", "yes please book",
        "i want to confirm", "please book", "confirm booking",
        "yes confirm booking", "ok proceed to payment",
        "looks good", "that's fine", "all good", "perfect book it",
        "yes that's correct", "go for it", "do it",
    ]
    for text in confirm_texts:
        examples.append({
            "text": text,
            "label": "confirm",
            "value": "true"
        })

    # ── Other/unknown examples ────────────────────────────────
    other_texts = [
    "hello", "hi", "thanks", "thank you", "bye", "goodbye",
    "what museums do you have", "tell me more", "cancel",
    "I changed my mind", "start over", "reset",
    "what are the prices", "how much does it cost",
    "is it open today", "what time do you close",
    "help", "what can you do", "i need help",
    "which museum is best", "recommend something",
    "what exhibitions are on", "any discounts",
    "do you have student tickets", "is parking available",
    "how do i get there", "what is the address",
    "can i cancel my booking", "refund policy",
    "i want to change my booking", "modify booking",
]
    for text in other_texts:
        examples.append({
            "text": text,
            "label": "other",
            "value": "none"
        })

    return examples


if __name__ == "__main__":
    examples = generate_examples()
    random.shuffle(examples)

    with open("training_data.json", "w") as f:
        json.dump(examples, f, indent=2)

    print(f"✅ Generated {len(examples)} training examples")

    # Count by label
    from collections import Counter
    counts = Counter(e["label"] for e in examples)
    for label, count in counts.items():
        print(f"   {label}: {count} examples")