"""
Museum Dataset Seeder
Generates 200 Indian museums with shows, assigns to 4 team members.
200 museums x 5 shows each = 1000 records

Auth fields match MuseumSignupRequest schema:
    museumName, email, phone, location, password

Run: python seed_museums.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
import random
import os
from dotenv import load_dotenv

load_dotenv()

# ── Config ─────────────────────────────────────────────────────────────────────

MONGO_URI    = os.getenv("MONGO_URI")
DB_NAME      = os.getenv("MONGO_DB_NAME", "museumDB")
pwd_context  = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 4 team members — museum owners (can log in with Museum@123)
OWNERS = [
    "anupamaixb04@gmail.com",
    "anushkayadav9e.gr1@gmail.com",
    "anushkabhasker12@gmail.com",
    "anushkawanve28@gmail.com",
]

# ── 200 Indian Museums ──────────────────────────────────────────────────────────

INDIAN_MUSEUMS = [
    # Delhi
    {"name": "National Museum",                          "city": "New Delhi",         "state": "Delhi",                    "type": "history"},
    {"name": "National Gallery of Modern Art",           "city": "New Delhi",         "state": "Delhi",                    "type": "art"},
    {"name": "Indira Gandhi Memorial Museum",            "city": "New Delhi",         "state": "Delhi",                    "type": "history"},
    {"name": "National Rail Museum",                     "city": "New Delhi",         "state": "Delhi",                    "type": "science"},
    {"name": "National Science Centre",                  "city": "New Delhi",         "state": "Delhi",                    "type": "science"},
    {"name": "Crafts Museum",                            "city": "New Delhi",         "state": "Delhi",                    "type": "culture"},
    {"name": "National Philatelic Museum",               "city": "New Delhi",         "state": "Delhi",                    "type": "culture"},
    {"name": "Gandhi Smriti",                            "city": "New Delhi",         "state": "Delhi",                    "type": "history"},
    {"name": "Nehru Memorial Museum",                    "city": "New Delhi",         "state": "Delhi",                    "type": "history"},
    {"name": "Air Force Museum",                         "city": "New Delhi",         "state": "Delhi",                    "type": "history"},
    # Mumbai
    {"name": "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya", "city": "Mumbai",      "state": "Maharashtra",              "type": "art"},
    {"name": "Dr. Bhau Daji Lad Museum",                 "city": "Mumbai",            "state": "Maharashtra",              "type": "history"},
    {"name": "Nehru Science Centre",                     "city": "Mumbai",            "state": "Maharashtra",              "type": "science"},
    {"name": "Mani Bhavan Gandhi Museum",                "city": "Mumbai",            "state": "Maharashtra",              "type": "history"},
    {"name": "RBI Monetary Museum",                      "city": "Mumbai",            "state": "Maharashtra",              "type": "culture"},
    {"name": "National Gallery of Modern Art Mumbai",    "city": "Mumbai",            "state": "Maharashtra",              "type": "art"},
    {"name": "Jijamata Udyaan Museum",                   "city": "Mumbai",            "state": "Maharashtra",              "type": "culture"},
    {"name": "Mumbai Police Museum",                     "city": "Mumbai",            "state": "Maharashtra",              "type": "history"},
    # Kolkata
    {"name": "Indian Museum",                            "city": "Kolkata",           "state": "West Bengal",              "type": "history"},
    {"name": "Victoria Memorial",                        "city": "Kolkata",           "state": "West Bengal",              "type": "history"},
    {"name": "Netaji Bhawan",                            "city": "Kolkata",           "state": "West Bengal",              "type": "history"},
    {"name": "Marble Palace Museum",                     "city": "Kolkata",           "state": "West Bengal",              "type": "art"},
    {"name": "Birla Industrial & Technological Museum",  "city": "Kolkata",           "state": "West Bengal",              "type": "science"},
    {"name": "Academy of Fine Arts",                     "city": "Kolkata",           "state": "West Bengal",              "type": "art"},
    {"name": "Gurusaday Museum",                         "city": "Kolkata",           "state": "West Bengal",              "type": "culture"},
    # Chennai
    {"name": "Government Museum Chennai",                "city": "Chennai",           "state": "Tamil Nadu",               "type": "history"},
    {"name": "Fort Museum Chennai",                      "city": "Chennai",           "state": "Tamil Nadu",               "type": "history"},
    {"name": "Arignar Anna Zoological Park Museum",      "city": "Chennai",           "state": "Tamil Nadu",               "type": "science"},
    {"name": "Dakshina Chitra Museum",                   "city": "Chennai",           "state": "Tamil Nadu",               "type": "culture"},
    {"name": "DakshinaChitra Heritage Museum",           "city": "Chennai",           "state": "Tamil Nadu",               "type": "culture"},
    # Hyderabad
    {"name": "Salar Jung Museum",                        "city": "Hyderabad",         "state": "Telangana",                "type": "art"},
    {"name": "Nizam's Museum",                           "city": "Hyderabad",         "state": "Telangana",                "type": "history"},
    {"name": "Birla Science Museum",                     "city": "Hyderabad",         "state": "Telangana",                "type": "science"},
    {"name": "AP State Museum",                          "city": "Hyderabad",         "state": "Telangana",                "type": "history"},
    {"name": "City Museum Hyderabad",                    "city": "Hyderabad",         "state": "Telangana",                "type": "culture"},
    # Bengaluru
    {"name": "Government Museum Bangalore",              "city": "Bengaluru",         "state": "Karnataka",                "type": "history"},
    {"name": "Visvesvaraya Industrial & Technological Museum", "city": "Bengaluru",   "state": "Karnataka",                "type": "science"},
    {"name": "National Military Memorial Museum",        "city": "Bengaluru",         "state": "Karnataka",                "type": "history"},
    {"name": "HAL Aerospace Museum",                     "city": "Bengaluru",         "state": "Karnataka",                "type": "science"},
    {"name": "Bangalore Palace Museum",                  "city": "Bengaluru",         "state": "Karnataka",                "type": "history"},
    {"name": "Karnataka Chitrakala Parishath",           "city": "Bengaluru",         "state": "Karnataka",                "type": "art"},
    # Jaipur
    {"name": "Albert Hall Museum",                       "city": "Jaipur",            "state": "Rajasthan",                "type": "history"},
    {"name": "City Palace Museum Jaipur",                "city": "Jaipur",            "state": "Rajasthan",                "type": "history"},
    {"name": "Jantar Mantar Museum",                     "city": "Jaipur",            "state": "Rajasthan",                "type": "science"},
    {"name": "Hawa Mahal Museum",                        "city": "Jaipur",            "state": "Rajasthan",                "type": "history"},
    {"name": "Anokhi Museum of Hand Printing",           "city": "Jaipur",            "state": "Rajasthan",                "type": "culture"},
    {"name": "Dolls Museum Jaipur",                      "city": "Jaipur",            "state": "Rajasthan",                "type": "culture"},
    # Agra
    {"name": "Taj Museum",                               "city": "Agra",              "state": "Uttar Pradesh",            "type": "history"},
    {"name": "Agra Museum",                              "city": "Agra",              "state": "Uttar Pradesh",            "type": "history"},
    # Varanasi
    {"name": "Bharat Kala Bhavan",                       "city": "Varanasi",          "state": "Uttar Pradesh",            "type": "art"},
    {"name": "Sarnath Archaeological Museum",            "city": "Varanasi",          "state": "Uttar Pradesh",            "type": "history"},
    {"name": "Ramnagar Fort Museum",                     "city": "Varanasi",          "state": "Uttar Pradesh",            "type": "history"},
    # Lucknow
    {"name": "State Museum Lucknow",                     "city": "Lucknow",           "state": "Uttar Pradesh",            "type": "history"},
    {"name": "Residency Museum Lucknow",                 "city": "Lucknow",           "state": "Uttar Pradesh",            "type": "history"},
    {"name": "Nawab Wajid Ali Shah Zoological Garden Museum", "city": "Lucknow",      "state": "Uttar Pradesh",            "type": "culture"},
    # Pune
    {"name": "Raja Dinkar Kelkar Museum",                "city": "Pune",              "state": "Maharashtra",              "type": "culture"},
    {"name": "Aga Khan Palace Museum",                   "city": "Pune",              "state": "Maharashtra",              "type": "history"},
    {"name": "Tribal Museum Pune",                       "city": "Pune",              "state": "Maharashtra",              "type": "culture"},
    # Ahmedabad
    {"name": "Calico Museum of Textiles",                "city": "Ahmedabad",         "state": "Gujarat",                  "type": "culture"},
    {"name": "Sabarmati Ashram Museum",                  "city": "Ahmedabad",         "state": "Gujarat",                  "type": "history"},
    {"name": "Auto World Vintage Car Museum",            "city": "Ahmedabad",         "state": "Gujarat",                  "type": "science"},
    {"name": "Shreyas Folk Museum",                      "city": "Ahmedabad",         "state": "Gujarat",                  "type": "culture"},
    {"name": "Kite Museum Ahmedabad",                    "city": "Ahmedabad",         "state": "Gujarat",                  "type": "culture"},
    # Bhopal
    {"name": "State Museum Bhopal",                      "city": "Bhopal",            "state": "Madhya Pradesh",           "type": "history"},
    {"name": "Bharat Bhavan",                            "city": "Bhopal",            "state": "Madhya Pradesh",           "type": "art"},
    {"name": "Indira Gandhi Rashtriya Manav Sangrahalaya","city": "Bhopal",           "state": "Madhya Pradesh",           "type": "culture"},
    # Goa
    {"name": "Goa State Museum",                         "city": "Panaji",            "state": "Goa",                      "type": "history"},
    {"name": "Museum of Goa",                            "city": "Pilerne",           "state": "Goa",                      "type": "art"},
    {"name": "Naval Aviation Museum Goa",                "city": "Vasco da Gama",     "state": "Goa",                      "type": "history"},
    # Thiruvananthapuram
    {"name": "Napier Museum",                            "city": "Thiruvananthapuram","state": "Kerala",                   "type": "culture"},
    {"name": "Kerala Museum",                            "city": "Thiruvananthapuram","state": "Kerala",                   "type": "history"},
    {"name": "Natural History Museum Kerala",            "city": "Thiruvananthapuram","state": "Kerala",                   "type": "science"},
    # Kochi
    {"name": "Kerala Folklore Museum",                   "city": "Kochi",             "state": "Kerala",                   "type": "culture"},
    {"name": "Indo-Portuguese Museum",                   "city": "Kochi",             "state": "Kerala",                   "type": "history"},
    # Mysuru
    {"name": "Mysore Palace Museum",                     "city": "Mysuru",            "state": "Karnataka",                "type": "history"},
    {"name": "Jaganmohan Palace Art Gallery",            "city": "Mysuru",            "state": "Karnataka",                "type": "art"},
    {"name": "Folklore Museum Mysore",                   "city": "Mysuru",            "state": "Karnataka",                "type": "culture"},
    # Patna
    {"name": "Patna Museum",                             "city": "Patna",             "state": "Bihar",                    "type": "history"},
    {"name": "Bihar Museum",                             "city": "Patna",             "state": "Bihar",                    "type": "history"},
    {"name": "Golghar Museum",                           "city": "Patna",             "state": "Bihar",                    "type": "history"},
    # Bhubaneswar
    {"name": "Odisha State Museum",                      "city": "Bhubaneswar",       "state": "Odisha",                   "type": "history"},
    {"name": "Regional Museum of Natural History",       "city": "Bhubaneswar",       "state": "Odisha",                   "type": "science"},
    {"name": "Tribal Research Museum Odisha",            "city": "Bhubaneswar",       "state": "Odisha",                   "type": "culture"},
    # Chandigarh
    {"name": "Government Museum Chandigarh",             "city": "Chandigarh",        "state": "Punjab",                   "type": "history"},
    {"name": "Rock Garden Museum",                       "city": "Chandigarh",        "state": "Punjab",                   "type": "art"},
    {"name": "Natural History Museum Chandigarh",        "city": "Chandigarh",        "state": "Punjab",                   "type": "science"},
    # Shimla
    {"name": "Himachal State Museum",                    "city": "Shimla",            "state": "Himachal Pradesh",         "type": "history"},
    {"name": "Indian Institute of Advanced Study Museum","city": "Shimla",            "state": "Himachal Pradesh",         "type": "culture"},
    # Dehradun
    {"name": "Wadia Institute of Himalayan Geology Museum","city": "Dehradun",        "state": "Uttarakhand",              "type": "science"},
    {"name": "Forest Research Institute Museum",         "city": "Dehradun",          "state": "Uttarakhand",              "type": "science"},
    # Guwahati
    {"name": "Assam State Museum",                       "city": "Guwahati",          "state": "Assam",                    "type": "history"},
    {"name": "Srimanta Sankardev Kalakshetra Museum",    "city": "Guwahati",          "state": "Assam",                    "type": "culture"},
    # Imphal
    {"name": "Manipur State Museum",                     "city": "Imphal",            "state": "Manipur",                  "type": "history"},
    {"name": "Kangla Museum",                            "city": "Imphal",            "state": "Manipur",                  "type": "history"},
    # Ranchi
    {"name": "Jharkhand State Tribal Museum",            "city": "Ranchi",            "state": "Jharkhand",                "type": "culture"},
    {"name": "Birsa Munda Museum",                       "city": "Ranchi",            "state": "Jharkhand",                "type": "history"},
    # Raipur
    {"name": "Mahant Ghasi Das Memorial Museum",         "city": "Raipur",            "state": "Chhattisgarh",             "type": "history"},
    {"name": "Tribal & Handicrafts Museum Raipur",       "city": "Raipur",            "state": "Chhattisgarh",             "type": "culture"},
    # Nagpur
    {"name": "Central Museum Nagpur",                    "city": "Nagpur",            "state": "Maharashtra",              "type": "history"},
    {"name": "Vidarbha Heritage Museum",                 "city": "Nagpur",            "state": "Maharashtra",              "type": "culture"},
    # Amritsar
    {"name": "Partition Museum",                         "city": "Amritsar",          "state": "Punjab",                   "type": "history"},
    {"name": "Maharaja Ranjit Singh Museum",             "city": "Amritsar",          "state": "Punjab",                   "type": "history"},
    # Jodhpur
    {"name": "Mehrangarh Museum",                        "city": "Jodhpur",           "state": "Rajasthan",                "type": "history"},
    {"name": "Umaid Bhawan Palace Museum",               "city": "Jodhpur",           "state": "Rajasthan",                "type": "history"},
    # Udaipur
    {"name": "City Palace Museum Udaipur",               "city": "Udaipur",           "state": "Rajasthan",                "type": "history"},
    {"name": "Vintage & Classic Car Collection Museum",  "city": "Udaipur",           "state": "Rajasthan",                "type": "science"},
    # Aurangabad
    {"name": "Aurangabad Museum",                        "city": "Aurangabad",        "state": "Maharashtra",              "type": "history"},
    {"name": "Ellora Caves Museum",                      "city": "Aurangabad",        "state": "Maharashtra",              "type": "history"},
    # Madurai
    {"name": "Government Museum Madurai",                "city": "Madurai",           "state": "Tamil Nadu",               "type": "history"},
    {"name": "Gandhi Museum Madurai",                    "city": "Madurai",           "state": "Tamil Nadu",               "type": "history"},
    # Coimbatore
    {"name": "Government Museum Coimbatore",             "city": "Coimbatore",        "state": "Tamil Nadu",               "type": "history"},
    {"name": "Dakshina Chitra Coimbatore",               "city": "Coimbatore",        "state": "Tamil Nadu",               "type": "culture"},
    # Visakhapatnam
    {"name": "Visakha Museum",                           "city": "Visakhapatnam",     "state": "Andhra Pradesh",           "type": "history"},
    {"name": "Submarine Museum Vizag",                   "city": "Visakhapatnam",     "state": "Andhra Pradesh",           "type": "science"},
    # Vijayawada
    {"name": "Victoria Jubilee Museum",                  "city": "Vijayawada",        "state": "Andhra Pradesh",           "type": "history"},
    # Tirupati
    {"name": "TTD Museum",                               "city": "Tirupati",          "state": "Andhra Pradesh",           "type": "culture"},
    # Mangaluru
    {"name": "Regional Museum of Natural History Mysore","city": "Mangaluru",         "state": "Karnataka",                "type": "science"},
    # Hubli
    {"name": "Hubli Museum",                             "city": "Hubli",             "state": "Karnataka",                "type": "history"},
    # Nashik
    {"name": "Nashik District Museum",                   "city": "Nashik",            "state": "Maharashtra",              "type": "history"},
    # Kolhapur
    {"name": "New Palace Museum Kolhapur",               "city": "Kolhapur",          "state": "Maharashtra",              "type": "history"},
    # Surat
    {"name": "Surat Museum",                             "city": "Surat",             "state": "Gujarat",                  "type": "history"},
    {"name": "Science Centre Surat",                     "city": "Surat",             "state": "Gujarat",                  "type": "science"},
    # Vadodara
    {"name": "Baroda Museum and Picture Gallery",        "city": "Vadodara",          "state": "Gujarat",                  "type": "art"},
    {"name": "Maharaja Fateh Singh Museum",              "city": "Vadodara",          "state": "Gujarat",                  "type": "art"},
    # Rajkot
    {"name": "Watson Museum",                            "city": "Rajkot",            "state": "Gujarat",                  "type": "history"},
    # Jamnagar
    {"name": "Lakhota Museum",                           "city": "Jamnagar",          "state": "Gujarat",                  "type": "history"},
    # Bhavnagar
    {"name": "Gaurishankar Lake Museum",                 "city": "Bhavnagar",         "state": "Gujarat",                  "type": "culture"},
    # Shimoga
    {"name": "Keladi Museum",                            "city": "Shimoga",           "state": "Karnataka",                "type": "history"},
    # Thrissur
    {"name": "Kerala Sahitya Akademi Museum",            "city": "Thrissur",          "state": "Kerala",                   "type": "culture"},
    # Kozhikode
    {"name": "Pazhassiraja Museum",                      "city": "Kozhikode",         "state": "Kerala",                   "type": "history"},
    # Pondicherry
    {"name": "Pondicherry Museum",                       "city": "Pondicherry",       "state": "Puducherry",               "type": "history"},
    {"name": "French Colonial Museum",                   "city": "Pondicherry",       "state": "Puducherry",               "type": "history"},
    # Hampi
    {"name": "Hampi Archaeological Museum",              "city": "Hampi",             "state": "Karnataka",                "type": "history"},
    # Puri
    {"name": "Puri Museum",                              "city": "Puri",              "state": "Odisha",                   "type": "history"},
    # Konark
    {"name": "Archaeological Museum Konark",             "city": "Konark",            "state": "Odisha",                   "type": "history"},
    # Sanchi
    {"name": "Sanchi Archaeological Museum",             "city": "Sanchi",            "state": "Madhya Pradesh",           "type": "history"},
    # Khajuraho
    {"name": "Khajuraho Archaeological Museum",          "city": "Khajuraho",         "state": "Madhya Pradesh",           "type": "history"},
    # Indore
    {"name": "Central Museum Indore",                    "city": "Indore",            "state": "Madhya Pradesh",           "type": "history"},
    {"name": "Lal Bagh Palace Museum",                   "city": "Indore",            "state": "Madhya Pradesh",           "type": "history"},
    # Gwalior
    {"name": "Gwalior Archaeological Museum",            "city": "Gwalior",           "state": "Madhya Pradesh",           "type": "history"},
    {"name": "Jai Vilas Palace Museum",                  "city": "Gwalior",           "state": "Madhya Pradesh",           "type": "history"},
    # Jabalpur
    {"name": "Rani Durgavati Museum",                    "city": "Jabalpur",          "state": "Madhya Pradesh",           "type": "history"},
    # Allahabad / Prayagraj
    {"name": "Allahabad Museum",                         "city": "Prayagraj",         "state": "Uttar Pradesh",            "type": "history"},
    {"name": "Anand Bhavan Museum",                      "city": "Prayagraj",         "state": "Uttar Pradesh",            "type": "history"},
    # Mathura
    {"name": "Government Museum Mathura",                "city": "Mathura",           "state": "Uttar Pradesh",            "type": "history"},
    # Haridwar
    {"name": "Haridwar Museum",                          "city": "Haridwar",          "state": "Uttarakhand",              "type": "culture"},
    # Rishikesh
    {"name": "Parmarth Niketan Museum",                  "city": "Rishikesh",         "state": "Uttarakhand",              "type": "culture"},
    # Dharamsala
    {"name": "Tibet Museum",                             "city": "Dharamsala",        "state": "Himachal Pradesh",         "type": "culture"},
    # Leh
    {"name": "Leh Palace Museum",                        "city": "Leh",               "state": "Ladakh",                   "type": "history"},
    {"name": "Hall of Fame Museum Leh",                  "city": "Leh",               "state": "Ladakh",                   "type": "history"},
    # Shillong
    {"name": "State Museum Shillong",                    "city": "Shillong",          "state": "Meghalaya",                "type": "history"},
    {"name": "Don Bosco Museum",                         "city": "Shillong",          "state": "Meghalaya",                "type": "culture"},
    # Itanagar
    {"name": "Jawaharlal Nehru State Museum",            "city": "Itanagar",          "state": "Arunachal Pradesh",        "type": "culture"},
    # Kohima
    {"name": "Nagaland State Museum",                    "city": "Kohima",            "state": "Nagaland",                 "type": "culture"},
    {"name": "Kohima War Cemetery Museum",               "city": "Kohima",            "state": "Nagaland",                 "type": "history"},
    # Aizawl
    {"name": "Mizoram State Museum",                     "city": "Aizawl",            "state": "Mizoram",                  "type": "culture"},
    # Gangtok
    {"name": "Namgyal Institute of Tibetology Museum",   "city": "Gangtok",           "state": "Sikkim",                   "type": "culture"},
    {"name": "Sikkim State Museum",                      "city": "Gangtok",           "state": "Sikkim",                   "type": "history"},
    # Agartala
    {"name": "Tripura Government Museum",                "city": "Agartala",          "state": "Tripura",                  "type": "history"},
    # Port Blair
    {"name": "Anthropological Museum Port Blair",        "city": "Port Blair",        "state": "Andaman & Nicobar",        "type": "culture"},
    {"name": "Cellular Jail Museum",                     "city": "Port Blair",        "state": "Andaman & Nicobar",        "type": "history"},
    # Kavaratti
    {"name": "Marine Museum Lakshadweep",                "city": "Kavaratti",         "state": "Lakshadweep",              "type": "science"},
    # Silvassa
    {"name": "Tribal Museum Silvassa",                   "city": "Silvassa",          "state": "Dadra & Nagar Haveli",     "type": "culture"},
    # Additional Delhi museums
    {"name": "National Museum of Natural History",       "city": "New Delhi",         "state": "Delhi",                    "type": "science"},
    {"name": "Purana Qila Museum",                       "city": "New Delhi",         "state": "Delhi",                    "type": "history"},
    {"name": "Shankar's International Dolls Museum",     "city": "New Delhi",         "state": "Delhi",                    "type": "culture"},
    {"name": "Museum of Archaeology Delhi",              "city": "New Delhi",         "state": "Delhi",                    "type": "history"},
    {"name": "Sulabh International Museum of Toilets",   "city": "New Delhi",         "state": "Delhi",                    "type": "culture"},
    {"name": "International Museum of Toilets",          "city": "New Delhi",         "state": "Delhi",                    "type": "culture"},
    # Additional Mumbai museums
    {"name": "Railway Heritage Museum Mumbai",           "city": "Mumbai",            "state": "Maharashtra",              "type": "history"},
    {"name": "Chhatrapati Shivaji Terminus Museum",      "city": "Mumbai",            "state": "Maharashtra",              "type": "history"},
    {"name": "Elephanta Island Museum",                  "city": "Mumbai",            "state": "Maharashtra",              "type": "history"},
    {"name": "Chhota Kashmir Museum",                    "city": "Mumbai",            "state": "Maharashtra",              "type": "culture"},
    # Additional Kolkata museums
    {"name": "Marble Palace Art Gallery Kolkata",        "city": "Kolkata",           "state": "West Bengal",              "type": "art"},
    {"name": "Tagore House Museum",                      "city": "Kolkata",           "state": "West Bengal",              "type": "history"},
    {"name": "Belur Math Museum",                        "city": "Kolkata",           "state": "West Bengal",              "type": "culture"},
    {"name": "Science City Kolkata",                     "city": "Kolkata",           "state": "West Bengal",              "type": "science"},
]

# ── Shows per museum type ───────────────────────────────────────────────────────

SHOWS_BY_TYPE = {
    "history": [
        {"name": "General Admittance",          "duration": 180, "price": {"adult": 200, "child": 100, "senior": 150}},
        {"name": "Ancient Civilizations Gallery","duration": 60,  "price": {"adult": 350, "child": 180, "senior": 300}},
        {"name": "Colonial Era Exhibition",      "duration": 45,  "price": {"adult": 280, "child": 140, "senior": 230}},
        {"name": "Freedom Struggle Gallery",     "duration": 60,  "price": {"adult": 300, "child": 150, "senior": 250}},
        {"name": "Archaeology & Artifacts Tour", "duration": 90,  "price": {"adult": 400, "child": 200, "senior": 350}},
    ],
    "art": [
        {"name": "General Admittance",           "duration": 180, "price": {"adult": 200, "child": 100, "senior": 150}},
        {"name": "Classical Indian Art Gallery", "duration": 60,  "price": {"adult": 320, "child": 160, "senior": 270}},
        {"name": "Modern Art Exhibition",        "duration": 45,  "price": {"adult": 280, "child": 140, "senior": 230}},
        {"name": "Sculpture & Crafts Tour",      "duration": 60,  "price": {"adult": 350, "child": 175, "senior": 300}},
        {"name": "Contemporary Masters Collection","duration": 45, "price": {"adult": 300, "child": 150, "senior": 250}},
    ],
    "science": [
        {"name": "General Admittance",           "duration": 180, "price": {"adult": 200, "child": 100, "senior": 150}},
        {"name": "Space & Astronomy Show",       "duration": 60,  "price": {"adult": 350, "child": 200, "senior": 300}},
        {"name": "Technology Through Ages",      "duration": 75,  "price": {"adult": 300, "child": 175, "senior": 250}},
        {"name": "Interactive Science Lab",      "duration": 90,  "price": {"adult": 400, "child": 220, "senior": 350}},
        {"name": "Robotics & AI Exhibition",     "duration": 60,  "price": {"adult": 380, "child": 200, "senior": 320}},
    ],
    "culture": [
        {"name": "General Admittance",           "duration": 180, "price": {"adult": 200, "child": 100, "senior": 150}},
        {"name": "Tribal Heritage Gallery",      "duration": 60,  "price": {"adult": 280, "child": 140, "senior": 230}},
        {"name": "Folk Arts & Crafts Show",      "duration": 45,  "price": {"adult": 250, "child": 125, "senior": 200}},
        {"name": "Traditional Music & Dance",    "duration": 60,  "price": {"adult": 350, "child": 175, "senior": 300}},
        {"name": "Regional Cuisine & Culture Tour","duration": 90, "price": {"adult": 320, "child": 160, "senior": 270}},
    ],
}

TIME_SLOTS = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"]

IMAGES_BY_TYPE = {
    "history": [
        "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80",
        "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&q=80",
        "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80",
        "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=800&q=80",
    ],
    "art": [
        "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&q=80",
        "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80",
        "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&q=80",
    ],
    "science": [
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
        "https://images.unsplash.com/photo-1532094349884-543559059786?w=800&q=80",
        "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=800&q=80",
        "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    ],
    "culture": [
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80",
        "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=800&q=80",
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
        "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80",
    ],
}

# ── Builder ─────────────────────────────────────────────────────────────────────

def build_museum_doc(museum: dict, owner_email: str, index: int) -> dict:
    mtype  = museum["type"]
    shows  = SHOWS_BY_TYPE[mtype]
    images = IMAGES_BY_TYPE[mtype]

    shows_with_slots = [
        {
            "name":               show["name"],
            "duration_minutes":   show["duration"],
            "timings":            TIME_SLOTS,
            "price":              show["price"],
            "capacity_per_slot":  random.choice([30, 40, 50, 60, 75]),
            "is_active":          True,
        }
        for show in shows
    ]

    return {
        # ── Auth fields ────────────────────────────────────────
        "museumName":  museum["name"],
        "email":       owner_email,
        "phone":       "+91-9999999999",
        "location":    f"{museum['city']}, {museum['state']}",
        "password":    pwd_context.hash("Museum@123"),
        "is_verified": True,

        # ── Profile ────────────────────────────────────────────
        "isProfileComplete": True,          # ← added here

        # ── Display / booking fields ───────────────────────────
        "city":          museum["city"],
        "state":         museum["state"],
        "category":      mtype,
        "description":   (
            f"A premier {mtype} museum in {museum['city']} showcasing "
            f"the rich heritage and culture of {museum['state']}."
        ),
        "image_url":     images[index % len(images)],
        "opening_hours": "9:00 AM - 6:00 PM",
        "closed_on":     "Monday",
        "shows":         shows_with_slots,
        "is_active":     True,
        "rating":        round(random.uniform(3.5, 5.0), 1),
        "total_reviews": random.randint(50, 2000),
        "created_at":    datetime.utcnow(),
    }

# ── Seeder ──────────────────────────────────────────────────────────────────────

async def seed():
    print("🌱 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    await db.museums.delete_many({})
    print("🗑️  Cleared existing museums")

    museums_to_insert = [
        build_museum_doc(museum, OWNERS[i % len(OWNERS)], i)
        for i, museum in enumerate(INDIAN_MUSEUMS)
    ]

    await db.museums.insert_many(museums_to_insert)
    print(f"\n✅ Seeded {len(museums_to_insert)} museums")
    print(f"📊 Each museum has 5 shows = {len(museums_to_insert) * 5} total show records")

    print(f"\n👤 Owner distribution:")
    for i, owner in enumerate(OWNERS):
        count = sum(1 for j in range(len(INDIAN_MUSEUMS)) if j % len(OWNERS) == i)
        print(f"   {owner}: {count} museums")

    # Indexes
    await db.museums.create_index([("email", 1)])
    await db.museums.create_index("city")
    await db.museums.create_index("category")
    await db.museums.create_index("is_active")
    await db.museums.create_index("museumName")
    print("\n📑 Indexes created")

    client.close()
    print("\n🎉 Done! Login with any owner email and password: Museum@123")


if __name__ == "__main__":
    asyncio.run(seed())