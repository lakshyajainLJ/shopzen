import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app import create_app
from utils.db import Database

@pytest.fixture
def app():
    os.environ["MONGODB_DATABASE"] = "shopzen_test"
    os.environ["JWT_SECRET_KEY"] = "test_jwt_secret_key_123"
    
    app = create_app()
    app.config["TESTING"] = True
    
    db = Database.get_db()
    db.users.delete_many({})
    db.products.delete_many({})
    db.carts.delete_many({})
    db.orders.delete_many({})
    
    yield app

@pytest.fixture
def client(app):
    return app.test_client()
