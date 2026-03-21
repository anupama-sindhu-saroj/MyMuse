from app.db.database import get_db

SHOWS = [
    {
        "name": "General Admittance",
        "category": "general",
        "description": "Access to all permanent galleries including Natural History, Indian Civilization, Science Discovery centre, and outdoor sculpture garden.",
        "location": "All Floors",
        "image_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1000",
        "duration_minutes": 240,
        "timings": ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"],
        "price": {"adult": 200, "child": 100, "senior": 150},
        "capacity_per_slot": 100,
        "is_active": True,
        "tags": ["all-access", "permanent-collection"]
    },
    {
        "name": "Dinosaur Exhibit",
        "category": "exhibition",
        "description": "Journey through 65 million years of dinosaur history with life-size fossil replicas, interactive displays, and a VR dinosaur experience.",
        "location": "Hall A, Ground Floor",
        "image_url": "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&q=80&w=1000",
        "duration_minutes": 60,
        "timings": ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
        "price": {"adult": 350, "child": 200, "senior": 300},
        "capacity_per_slot": 50,
        "is_active": True,
        "tags": ["science", "kids-friendly", "interactive"]
    },
    {
        "name": "Space & Cosmos Gallery",
        "category": "exhibition",
        "description": "Explore the universe with scale models of planets, real meteorite samples, and a 360-degree planetarium dome show.",
        "location": "Hall B, First Floor",
        "image_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000",
        "duration_minutes": 75,
        "timings": ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
        "price": {"adult": 300, "child": 175, "senior": 250},
        "capacity_per_slot": 40,
        "is_active": True,
        "tags": ["science", "astronomy", "educational"]
    },
    {
        "name": "Ancient Egypt",
        "category": "exhibition",
        "description": "Discover the mysteries of ancient Egypt with authentic artifacts, mummy displays, hieroglyphic workshops, and a replica of the Valley of the Kings.",
        "location": "Hall C, Ground Floor",
        "image_url": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&q=80&w=1000",
        "duration_minutes": 60,
        "timings": ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
        "price": {"adult": 320, "child": 180, "senior": 270},
        "capacity_per_slot": 45,
        "is_active": True,
        "tags": ["history", "archaeology", "culture"]
    },
    {
        "name": "Modern Art Collection",
        "category": "exhibition",
        "description": "Experience contemporary art from leading Indian and international artists featuring paintings, sculptures, and immersive digital installations.",
        "location": "Hall D, Second Floor",
        "image_url": "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=1000",
        "duration_minutes": 45,
        "timings": ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
        "price": {"adult": 280, "child": 150, "senior": 230},
        "capacity_per_slot": 60,
        "is_active": True,
        "tags": ["art", "culture", "contemporary"]
    }
]

async def seed_shows():
    db = get_db()
    count = await db.shows.count_documents({})
    if count > 0:
        print("✅ Shows already seeded")
        return
    await db.shows.insert_many(SHOWS)
    print(f"✅ Seeded {len(SHOWS)} shows")

async def get_all_shows():
    db = get_db()
    cursor = db.shows.find({"is_active": True})
    shows = []
    async for show in cursor:
        show["id"] = str(show["_id"])
        del show["_id"]
        shows.append(show)
    return shows