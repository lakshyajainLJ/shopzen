import bcrypt
from datetime import datetime
from utils.db import get_db
from utils.logger import logger

PRODUCTS_SEED = [
    {
        "name": "Classic White T-Shirt",
        "title": "Classic White T-Shirt",
        "price": 799,
        "description": "Premium cotton crew neck t-shirt. Soft, breathable fabric perfect for everyday wear.",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        "category": "Fashion",
        "stock": 150
    },
    {
        "name": "Running Sneakers Pro",
        "title": "Running Sneakers Pro",
        "price": 3499,
        "description": "Lightweight running shoes with cushioned sole and breathable mesh upper.",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        "category": "Fashion",
        "stock": 80
    },
    {
        "name": "Luxury Chronograph Watch",
        "title": "Luxury Chronograph Watch",
        "price": 8999,
        "description": "Stainless steel chronograph watch with sapphire crystal and leather strap.",
        "image": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
        "category": "Watches",
        "stock": 45
    },
    {
        "name": "Wireless Noise-Cancelling Headphones",
        "title": "Wireless Noise-Cancelling Headphones",
        "price": 4999,
        "description": "Over-ear headphones with active noise cancellation and 30-hour battery life.",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        "category": "Electronics",
        "stock": 60
    },
    {
        "name": "Leather Crossbody Bag",
        "title": "Leather Crossbody Bag",
        "price": 2499,
        "description": "Genuine leather crossbody bag with adjustable strap and multiple compartments.",
        "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
        "category": "Bags",
        "stock": 35
    },
    {
        "name": "Smartphone Pro Max",
        "title": "Smartphone Pro Max",
        "price": 69999,
        "description": "Latest flagship smartphone with 108MP camera, 5G connectivity, and AMOLED display.",
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
        "category": "Electronics",
        "stock": 25
    },
    {
        "name": "Aviator Sunglasses",
        "title": "Aviator Sunglasses",
        "price": 1999,
        "description": "Classic aviator sunglasses with UV400 protection and polarized lenses.",
        "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
        "category": "Accessories",
        "stock": 100
    },
    {
        "name": "Slim Fit Denim Jeans",
        "title": "Slim Fit Denim Jeans",
        "price": 1899,
        "description": "Stretch denim slim fit jeans with classic 5-pocket design.",
        "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        "category": "Fashion",
        "stock": 120
    },
    {
        "name": "Bluetooth Speaker Portable",
        "title": "Bluetooth Speaker Portable",
        "price": 2999,
        "description": "Waterproof portable Bluetooth speaker with 360° sound and 12-hour battery.",
        "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
        "category": "Electronics",
        "stock": 70
    },
    {
        "name": "Canvas Backpack",
        "title": "Canvas Backpack",
        "price": 1599,
        "description": "Durable canvas backpack with laptop compartment and water-resistant coating.",
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        "category": "Bags",
        "stock": 90
    },
    {
        "name": "Mechanical Keyboard RGB",
        "title": "Mechanical Keyboard RGB",
        "price": 5499,
        "description": "Cherry MX mechanical keyboard with per-key RGB lighting and aluminum frame.",
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
        "category": "Electronics",
        "stock": 40
    },
    {
        "name": "Sports Digital Watch",
        "title": "Sports Digital Watch",
        "price": 2999,
        "description": "Multi-sport GPS watch with heart rate monitor and 7-day battery life.",
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        "category": "Watches",
        "stock": 65
    },
    {
        "name": "Wireless Earbuds Pro",
        "title": "Wireless Earbuds Pro",
        "price": 3999,
        "description": "True wireless earbuds with ANC, transparency mode, and wireless charging case.",
        "image": "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400",
        "category": "Electronics",
        "stock": 110
    },
    {
        "name": "Cotton Polo Shirt",
        "title": "Cotton Polo Shirt",
        "price": 1299,
        "description": "Classic fit polo shirt in premium piqué cotton with embroidered logo.",
        "image": "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400",
        "category": "Fashion",
        "stock": 140
    },
    {
        "name": "Laptop Stand Adjustable",
        "title": "Laptop Stand Adjustable",
        "price": 1999,
        "description": "Ergonomic aluminum laptop stand with adjustable height and angle.",
        "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
        "category": "Accessories",
        "stock": 85
    },
    {
        "name": "Leather Wallet Bifold",
        "title": "Leather Wallet Bifold",
        "price": 999,
        "description": "Genuine leather bifold wallet with RFID blocking and multiple card slots.",
        "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400",
        "category": "Accessories",
        "stock": 130
    },
    {
        "name": "Fitness Tracker Band",
        "title": "Fitness Tracker Band",
        "price": 2499,
        "description": "Slim fitness tracker with SpO2, sleep tracking, and 14-day battery.",
        "image": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400",
        "category": "Electronics",
        "stock": 95
    },
    {
        "name": "Casual Sneakers White",
        "title": "Casual Sneakers White",
        "price": 2799,
        "description": "Minimalist white leather sneakers with cushioned insole and rubber outsole.",
        "image": "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400",
        "category": "Fashion",
        "stock": 75
    },
    {
        "name": "Travel Duffle Bag",
        "title": "Travel Duffle Bag",
        "price": 3499,
        "description": "Spacious duffle bag with shoe compartment, water-resistant fabric.",
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        "category": "Bags",
        "stock": 50
    },
    {
        "name": "Smart Watch Ultra",
        "title": "Smart Watch Ultra",
        "price": 12999,
        "description": "Premium smartwatch with titanium case, always-on display, and cellular connectivity.",
        "image": "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400",
        "category": "Watches",
        "stock": 30
    }
]

def seed_database():
    db = get_db()
    
    # 1. Seed Products if empty or update
    logger.info("Seeding products collection...")
    for p in PRODUCTS_SEED:
        p["created_at"] = datetime.utcnow()
        p["updated_at"] = datetime.utcnow()
        db.products.update_one(
            {"name": p["name"]},
            {"$set": p},
            upsert=True
        )
    logger.info(f"✅ Seeding complete: {len(PRODUCTS_SEED)} products inserted/updated in MongoDB.")

    # 2. Seed Default Admin User if not exists
    admin_email = "admin@shopzen.com"
    if not db.users.find_one({"email": admin_email}):
        hashed_pw = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt())
        db.users.insert_one({
            "name": "ShopZen Admin",
            "email": admin_email,
            "password": hashed_pw,
            "role": "admin",
            "created_at": datetime.utcnow()
        })
        logger.info(f"✅ Default Admin created: {admin_email} / admin123")

    # 3. Seed Sample User if not exists
    user_email = "customer@shopzen.com"
    if not db.users.find_one({"email": user_email}):
        hashed_pw = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt())
        db.users.insert_one({
            "name": "Demo Customer",
            "email": user_email,
            "password": hashed_pw,
            "role": "user",
            "created_at": datetime.utcnow()
        })
        logger.info(f"✅ Demo Customer created: {user_email} / password123")

if __name__ == "__main__":
    seed_database()
