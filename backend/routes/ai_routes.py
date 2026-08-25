from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from middleware.auth import admin_required
from services.ai_service import AIService
from services.recommendation_service import RecommendationService
from utils.response import success_response, error_response

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/ai/chat", methods=["POST"])
def ai_chat():
    data = request.json or {}
    messages = data.get("messages", [])
    if not messages:
        return error_response(code="VALIDATION_ERROR", message="Messages array is required", status_code=400)

    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    res = AIService.chat_with_assistant(messages, user_id=user_id)
    return success_response(data=res)

@ai_bp.route("/ai/semantic-search", methods=["POST"])
def semantic_search():
    data = request.json or {}
    query = data.get("query", "")
    category = data.get("category")
    max_price = data.get("max_price")
    limit = int(data.get("limit", 10))

    results = AIService.semantic_search(query, category=category, max_price=max_price, limit=limit)
    return success_response(data=results)

@ai_bp.route("/recommendations", methods=["GET"])
def get_recommendations():
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    limit = request.args.get("limit", 6, type=int)
    results = RecommendationService.get_recommendations(user_id=user_id, limit=limit)
    return success_response(data=results)

@ai_bp.route("/ai/summarize-reviews", methods=["POST"])
def summarize_reviews():
    data = request.json or {}
    product_id = data.get("product_id")
    if not product_id:
        return error_response(code="VALIDATION_ERROR", message="product_id is required", status_code=400)

    summary = AIService.summarize_reviews(product_id)
    return success_response(data=summary)

@ai_bp.route("/admin/ai/generate-description", methods=["POST"])
@admin_required()
def generate_admin_description():
    data = request.json or {}
    name = data.get("name")
    category = data.get("category", "General")
    key_features = data.get("key_features", "")

    if not name:
        return error_response(code="VALIDATION_ERROR", message="Product name is required", status_code=400)

    res = AIService.generate_admin_product_description(name, category, key_features)
    return success_response(data=res)
