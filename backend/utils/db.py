import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from utils.logger import logger

DEFAULT_ATLAS_URI = "mongodb+srv://lakshyajain579_db_user:VnbKFiLOc7KDFeQQ@cluster0.ys18qyh.mongodb.net/?retryWrites=true&w=majority"

class Database:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        if cls._db is None:
            mongo_uri = os.environ.get("MONGODB_URI", DEFAULT_ATLAS_URI)
            db_name = os.environ.get("MONGODB_DATABASE", "shopzen")
            
            logger.info(f"Connecting to MongoDB Atlas database: {db_name}")
            cls._client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            cls._db = cls._client[db_name]
            
            # Ensure indexes on startup
            cls.ensure_indexes(cls._db)
        return cls._db

    @classmethod
    def ensure_indexes(cls, db):
        try:
            # Users indexes
            db.users.create_index([("email", ASCENDING)], unique=True)
            
            # Products indexes
            db.products.create_index([("category", ASCENDING)])
            db.products.create_index([("name", ASCENDING)])
            
            # Orders indexes
            db.orders.create_index([("user_id", ASCENDING)])
            db.orders.create_index([("created_at", DESCENDING)])
            
            # Reviews indexes
            db.reviews.create_index([("product_id", ASCENDING)])
            
            # Wishlists indexes
            db.wishlists.create_index([("user_id", ASCENDING)], unique=True)
            
            # Carts indexes
            db.carts.create_index([("user_id", ASCENDING)], unique=True)
            
            logger.info("Database indexes ensured successfully.")
        except Exception as e:
            logger.error(f"Error ensuring indexes: {str(e)}")

def get_db():
    return Database.get_db()
