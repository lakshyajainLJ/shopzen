from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["flipkart"]          # ← changed from shopzen to flipkart

db.users.update_one(
    {"email": "lakshya@gmail.com"},
    {"$set": {"role": "admin"}}
)

print("✅ Done! Lakshya is now admin.")