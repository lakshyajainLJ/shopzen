import sys
from utils.db import get_db

def make_admin(email):
    db = get_db()
    res = db.users.update_one(
        {"email": email.strip().lower()},
        {"$set": {"role": "admin"}}
    )
    if res.matched_count > 0:
        print(f"✅ User '{email}' is now an admin.")
    else:
        print(f"❌ User with email '{email}' not found.")

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "lakshya@gmail.com"
    make_admin(email)