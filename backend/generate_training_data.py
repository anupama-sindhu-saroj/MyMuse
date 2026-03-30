"""
Generate training data for booking field extraction classifier.
Run: python generate_training_data.py
"""

import json
import random
from datetime import datetime, timedelta

# ── FIX 2: Shows now match EXACTLY what seed_museums.py puts in MongoDB ───────
SHOWS = [
    "General Admittance",
    "Ancient Civilizations Gallery",
    "Colonial Era Exhibition",
    "Freedom Struggle Gallery",
    "Archaeology & Artifacts Tour",
    "Classical Indian Art Gallery",
    "Modern Art Exhibition",
    "Sculpture & Crafts Tour",
    "Contemporary Masters Collection",
    "Space & Astronomy Show",
    "Technology Through Ages",
    "Interactive Science Lab",
    "Robotics & AI Exhibition",
    "Tribal Heritage Gallery",
    "Folk Arts & Crafts Show",
    "Traditional Music & Dance",
    "Regional Cuisine & Culture Tour",
]

DATES = []
today = datetime.now()
for i in range(1, 30):
    d = today + timedelta(days=i)
    if d.weekday() != 0:  # skip Monday (closed)
        DATES.append(d.strftime("%Y-%m-%d"))

DATE_WORDS = {
    "today": today.strftime("%Y-%m-%d"),
    "tomorrow": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
    "saturday": None,
    "sunday": None,
    "this weekend": None,
}

for i in range(1, 8):
    d = today + timedelta(days=i)
    if d.weekday() == 5:
        DATE_WORDS["saturday"] = d.strftime("%Y-%m-%d")
        DATE_WORDS["this weekend"] = d.strftime("%Y-%m-%d")
    if d.weekday() == 6:
        DATE_WORDS["sunday"] = d.strftime("%Y-%m-%d")

TIME_SLOTS = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"]
TIME_WORDS = {
    "9": "9:00 AM", "9am": "9:00 AM", "9 am": "9:00 AM",
    "10": "10:00 AM", "10am": "10:00 AM", "10 am": "10:00 AM", "morning": "10:00 AM",
    "11": "11:00 AM", "11am": "11:00 AM",
    "12": "12:00 PM", "12pm": "12:00 PM", "noon": "12:00 PM",
    "1": "1:00 PM", "1pm": "1:00 PM",
    "2": "2:00 PM", "2pm": "2:00 PM", "afternoon": "2:00 PM",
    "3": "3:00 PM", "3pm": "3:00 PM",
    "4": "4:00 PM", "4pm": "4:00 PM",
    "5": "5:00 PM", "5pm": "5:00 PM", "evening": "5:00 PM",
}


def generate_examples():
    examples = []

    # ── Show extraction examples ──────────────────────────────────────────────
    for show in SHOWS:
        show_lower = show.lower()
        # Use first meaningful word for short-form references
        words = [w for w in show_lower.split() if len(w) > 3]
        short = words[0] if words else show_lower.split()[0]

        templates = [
            f"I want to visit {show}",
            f"Book tickets for {show}",
            f"I'm interested in {show}",
            f"Can I book {show}?",
            f"We'd like to see {show}",
            f"{show} please",
            f"I want {show}",
            f"I'd like to attend {show}",
            f"Interested in {short} show",
            f"The {short} one",
            f"We want to go to {show}",
            f"Book me for {show}",
            f"I want tickets to {show}",
            f"Take me to {show}",
            f"Show: {show}",
        ]
        for t in templates:
            examples.append({
                "text": t,
                "label": "show",
                "value": show
            })

    # ── Ticket count examples ─────────────────────────────────────────────────
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
        ("2 adults and 1 child", {"adult": 2, "child": 1, "senior": 0}),   # duplicate intentionally for weight
        ("1 adult and 1 child", {"adult": 1, "child": 1, "senior": 0}),
        ("3 adults and 2 children", {"adult": 3, "child": 2, "senior": 0}),
        ("2 adults 1 senior citizen", {"adult": 2, "child": 0, "senior": 1}),
        ("4 people total", {"adult": 4, "child": 0, "senior": 0}),
        ("we are a group of 6", {"adult": 6, "child": 0, "senior": 0}),
        ("booking for 2 adults", {"adult": 2, "child": 0, "senior": 0}),
        ("1 adult ticket please", {"adult": 1, "child": 0, "senior": 0}),
        ("i want to book 2 tickets for victoria memorial", {"adult": 2, "child": 0, "senior": 0}),
("i want 2 tickets", {"adult": 2, "child": 0, "senior": 0}),
("can you add one more child ticket for it", {"adult": 0, "child": 1, "senior": 0}),
("add one more child", {"adult": 0, "child": 1, "senior": 0}),
("please add one more child ticket for it", {"adult": 0, "child": 1, "senior": 0}),
("add another child ticket", {"adult": 0, "child": 1, "senior": 0}),
("one more child ticket please", {"adult": 0, "child": 1, "senior": 0}),
("add 2 more adults", {"adult": 2, "child": 0, "senior": 0}),
("make it 3 adults total", {"adult": 3, "child": 0, "senior": 0}),
("change to 2 adults", {"adult": 2, "child": 0, "senior": 0}),
("i need 4 tickets", {"adult": 4, "child": 0, "senior": 0}),
("book 2 adult tickets please", {"adult": 2, "child": 0, "senior": 0}),
("2 tickets for us", {"adult": 2, "child": 0, "senior": 0}),
("3 of us are coming", {"adult": 3, "child": 0, "senior": 0}),
("we need tickets for 4", {"adult": 4, "child": 0, "senior": 0}),
("i want to book 2 tickets for victoria memorial", {"adult": 2, "child": 0, "senior": 0}),
("i want to book 3 tickets for national museum", {"adult": 3, "child": 0, "senior": 0}),
("i want to book tickets for indian museum", {"adult": 1, "child": 0, "senior": 0}),
("book 2 tickets for salar jung museum", {"adult": 2, "child": 0, "senior": 0}),
("2 tickets for this museum", {"adult": 2, "child": 0, "senior": 0}),
("tickets for victoria memorial", {"adult": 1, "child": 0, "senior": 0}),
("family of 4", {"adult": 2, "child": 2, "senior": 0}),
("family of 5", {"adult": 3, "child": 2, "senior": 0}),
("family of 3", {"adult": 2, "child": 1, "senior": 0}),
("family of 6", {"adult": 3, "child": 3, "senior": 0}),
("we are a family of 4", {"adult": 2, "child": 2, "senior": 0}),
("coming as a family of 5", {"adult": 3, "child": 2, "senior": 0}),
    ]
    for text, value in ticket_templates:
        examples.append({
            "text": text,
            "label": "tickets",
            "value": json.dumps(value)
        })

    # ── Date examples ─────────────────────────────────────────────────────────
    for word, date_val in DATE_WORDS.items():
        if date_val:
            for template in [
                f"on {word}",
                f"visit {word}",
                f"I want to go {word}",
                f"booking for {word}",
                f"{word} please",
                f"can we come {word}",
                f"the upcoming {word}",
                f"the upcoming {word} would work",
                f"the upcoming {word} would work for me",
                f"how about {word}",
                f"{word} works for me",
                f"I prefer {word}",
            ]:
                examples.append({
                    "text": template,
                    "label": "date",
                    "value": date_val
                })

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

    # ── Time slot examples ────────────────────────────────────────────────────
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

    # ── Confirmation examples ─────────────────────────────────────────────────
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
        "yes that works", "perfect that's right", "yeah go ahead",
        "sure thing", "of course", "definitely", "100%", "approved",
        "i agree", "that looks right", "correct proceed",
        "ok let's go", "yes let's book", "please finalize",
        "submit", "pay now", "proceed to pay", "take my booking",
        "yes book it for me", "please go ahead and book",
        "confirm my booking", "yes i want to book",
        "that's correct book it", "yes all details are correct",
        "ok finalize my booking", "yes please confirm",
        "i'm ready to pay", "ready to pay",
        "take me to payment", "proceed to checkout",
        "yes checkout", "i want to pay now",
        "book and pay", "yes submit my booking",
        "all good confirm", "everything looks good",
        "yes that's my booking", "lock it in",
        "i'm satisfied confirm", "yes proceed with booking",
        "finalize the booking",
        "finalize my booking",
        "please finalize the booking",
        "yes finalize the booking",
        "finalize it",
        "finalize and pay",
        "ok finalize",
        "let's finalize",
        "i want to finalize",
        "finalize now",
        ]
    for text in confirm_texts:
        examples.append({
            "text": text,
            "label": "confirm",
            "value": "true"
        })

    # ── Other/unknown examples ────────────────────────────────────────────────
    other_texts = [
    # greetings
    "hello", "hi", "hey", "hi there", "hello there", "good morning",
    "good afternoon", "good evening", "hiya", "howdy",
    # thanks / bye
    "thanks", "thank you", "thanks a lot", "bye", "goodbye", "see you",
    "thank you so much", "much appreciated", "cheers",
    # questions
    "what museums do you have", "tell me more", "what can you do",
    "i need help", "help me", "help", "what is this",
    "which museum is best", "recommend something", "any suggestions",
    "what exhibitions are on", "any discounts", "student discount",
    "do you have student tickets", "is parking available",
    "how do i get there", "what is the address", "where is it",
    "how far is it", "is it accessible", "wheelchair access",
    # cancellation / changes
    "cancel", "i changed my mind", "start over", "reset",
    "can i cancel my booking", "refund policy", "i want a refund",
    "i want to change my booking", "modify booking", "reschedule",
    # prices
    "what are the prices", "how much does it cost", "pricing",
    "how much is it", "what does it cost", "tell me the price",
    # timings
    "is it open today", "what time do you close", "opening hours",
    "when do you open", "are you open on sunday", "closed today",
    # misc
    "okay cool", "sounds interesting", "not sure", "maybe",
    "let me think", "give me a moment", "one second",
    "what else", "anything else", "never mind", "forget it",
    "what are the timings of shows",
    "what are the show timings",
    "what are the timings",
    "timings of shows",
    "show timings please",
    "what time are the shows",
    "tell me the timings",
    "when are the shows",
    "what time does it start",
    "show schedule",
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

    from collections import Counter
    counts = Counter(e["label"] for e in examples)
    for label, count in sorted(counts.items()):
        print(f"   {label}: {count} examples")