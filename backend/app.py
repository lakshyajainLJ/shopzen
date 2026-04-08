from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from config import Config

from routes.auth_routes import auth
from routes.product_routes import product
from routes.cart_routes import cart
from routes.order_routes import order
from routes.admin_routes import admin, init_admin    # ← changed

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app)

# Initialize extensions
mongo = PyMongo(app)
jwt = JWTManager(app)

# Pass mongo to admin routes
init_admin(mongo)                                    # ← NEW

# Register blueprints
app.register_blueprint(auth)
app.register_blueprint(product)
app.register_blueprint(cart)
app.register_blueprint(order)
app.register_blueprint(admin)


@app.route("/")
def home():
    return {"message": "Backend + Local MongoDB connected"}


if __name__ == "__main__":
    app.run(debug=True)