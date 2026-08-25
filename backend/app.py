import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from utils.db import get_db
from middleware.error_handler import register_error_handlers
from utils.response import success_response
from utils.logger import logger

from routes.auth_routes import auth
from routes.product_routes import product
from routes.cart_routes import cart
from routes.order_routes import order
from routes.admin_routes import admin
from routes.ai_routes import ai_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Restrict CORS to configured origins
    CORS(app, resources={r"/*": {"origins": [Config.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "*"]}})

    # Initialize extensions & error handlers
    JWTManager(app)
    register_error_handlers(app)

    # Register Blueprints
    app.register_blueprint(auth)
    app.register_blueprint(product)
    app.register_blueprint(cart)
    app.register_blueprint(order)
    app.register_blueprint(admin)
    app.register_blueprint(ai_bp)

    @app.route("/")
    @app.route("/health")
    def health_check():
        try:
            db = get_db()
            db.command("ping")
            db_status = "connected"
        except Exception as e:
            db_status = f"disconnected: {str(e)}"
            
        return success_response(data={
            "status": "healthy",
            "database": db_status,
            "version": "2.0.0"
        })

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting ShopZen 2.0 Backend on port {port}")
    app.run(host="0.0.0.0", port=port)