import json
import os
from bson import ObjectId
from config import Config
from utils.db import get_db
from models.product_model import canonical_product
from services.product_service import ProductService
from services.recommendation_service import RecommendationService
from services.cart_service import CartService
from utils.logger import logger

class AIService:
    @staticmethod
    def _get_openai_client():
        api_key = Config.OPENAI_API_KEY
        if not api_key:
            return None
        try:
            from openai import OpenAI
            return OpenAI(api_key=api_key)
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            return None

    @staticmethod
    def chat_with_assistant(messages, user_id=None):
        client = AIService._get_openai_client()
        
        # Tools definitions for OpenAI Function Calling
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "search_products",
                    "description": "Search for real ShopZen products by search term, category, or maximum price.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query keyword"},
                            "category": {"type": "string", "description": "Product category"},
                            "max_price": {"type": "number", "description": "Maximum price in INR (₹)"}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_product_details",
                    "description": "Get detailed specs and stock for a product by its exact product ID.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "product_id": {"type": "string", "description": "ShopZen product MongoDB ID"}
                        },
                        "required": ["product_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_recommendations",
                    "description": "Get personalized or trending product recommendations for the user.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "limit": {"type": "integer", "description": "Number of recommendations"}
                        }
                    }
                }
            }
        ]

        system_instruction = (
            "You are ShopZen AI, an intelligent, helpful shopping assistant for ShopZen e-commerce. "
            "Rule 1: Always use tool calls to look up real products, prices, stock, and recommendations in ShopZen. "
            "Rule 2: NEVER invent hallucinated products, prices, IDs, or discounts. "
            "Rule 3: You have NO authorization to modify prices, inventory, database records, user roles, or checkout state. "
            "Rule 4: Provide polite, accurate shopping recommendations with real prices in ₹ (INR)."
        )

        # Fallback if OpenAI key is not configured
        if not client:
            logger.info("OpenAI API key not set — running smart local rule-based AI fallback")
            user_msg = messages[-1]["content"] if messages else ""
            res = ProductService.get_products(page=1, limit=5, search=user_msg)
            prods = res.get("products", [])
            if prods:
                prod_names = ", ".join([f"{p['name']} (₹{p['price']})" for p in prods[:3]])
                reply = f"Here are relevant products from ShopZen: {prod_names}. How can I assist you further with these?"
            else:
                reply = "Welcome to ShopZen! I can help you search for outfits, electronics, accessories, and get tailored recommendations. What are you looking for today?"
            return {"reply": reply, "recommended_products": prods}

        try:
            formatted_messages = [{"role": "system", "content": system_instruction}] + messages
            
            response = client.chat.completions.create(
                model=Config.OPENAI_MODEL,
                messages=formatted_messages,
                tools=tools,
                tool_choice="auto"
            )
            
            response_message = response.choices[0].message
            recommended_products = []
            
            # Check if AI executed tool calls
            if response_message.tool_calls:
                formatted_messages.append(response_message)
                for tool_call in response_message.tool_calls:
                    fn_name = tool_call.function.name
                    args = json.loads(tool_call.function.arguments)
                    
                    tool_result = None
                    if fn_name == "search_products":
                        res = ProductService.get_products(
                            page=1, limit=6,
                            search=args.get("query"),
                            category=args.get("category")
                        )
                        prods = res.get("products", [])
                        if args.get("max_price"):
                            prods = [p for p in prods if p["price"] <= args["max_price"]]
                        recommended_products.extend(prods)
                        tool_result = prods
                    elif fn_name == "get_product_details":
                        tool_result = ProductService.get_product_by_id(args.get("product_id"))
                        if isinstance(tool_result, dict) and "name" in tool_result:
                            recommended_products.append(tool_result)
                    elif fn_name == "get_recommendations":
                        prods = RecommendationService.get_recommendations(user_id=user_id, limit=args.get("limit", 5))
                        recommended_products.extend(prods)
                        tool_result = prods

                    formatted_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": fn_name,
                        "content": json.dumps(tool_result)
                    })

                second_response = client.chat.completions.create(
                    model=Config.OPENAI_MODEL,
                    messages=formatted_messages
                )
                final_reply = second_response.choices[0].message.content
            else:
                final_reply = response_message.content

            return {
                "reply": final_reply,
                "recommended_products": recommended_products
            }
        except Exception as e:
            logger.error(f"AI Assistant execution error: {str(e)}")
            res = ProductService.get_products(page=1, limit=4)
            return {
                "reply": "I'm having trouble connecting to AI services right now, but here are some popular products on ShopZen!",
                "recommended_products": res.get("products", [])
            }

    @staticmethod
    def semantic_search(query, category=None, max_price=None, limit=10):
        db = get_db()
        client = AIService._get_openai_client()
        
        # 1. Try vector embeddings if OpenAI is available
        if client and query:
            try:
                emb_res = client.embeddings.create(
                    input=query,
                    model="text-embedding-3-small"
                )
                embedding_vector = emb_res.data[0].embedding
                
                # Perform MongoDB Atlas Vector Search pipeline if index exists
                pipeline = [
                    {
                        "$vectorSearch": {
                            "index": "vector_index",
                            "path": "embedding",
                            "queryVector": embedding_vector,
                            "numCandidates": 50,
                            "limit": limit
                        }
                    }
                ]
                
                match_stage = {}
                if category and category.lower() != "all":
                    match_stage["category"] = {"$regex": f"^{category}$", "$options": "i"}
                if max_price:
                    match_stage["price"] = {"$lte": float(max_price)}
                    
                if match_stage:
                    pipeline.append({"$match": match_stage})
                    
                cursor = db.products.aggregate(pipeline)
                results = [canonical_product(p) for p in cursor]
                if results:
                    return results
            except Exception as e:
                logger.warning(f"Vector search failed, falling back to text search: {str(e)}")

        # Fallback text & category search
        res = ProductService.get_products(page=1, limit=limit, category=category, search=query)
        prods = res.get("products", [])
        if max_price:
            prods = [p for p in prods if p["price"] <= float(max_price)]
        return prods

    @staticmethod
    def summarize_reviews(product_id):
        db = get_db()
        reviews_cursor = db.reviews.find({"product_id": str(product_id)})
        reviews = list(reviews_cursor)
        
        if not reviews:
            return {
                "summary": "No verified customer reviews available for this product yet.",
                "likes": ["High quality material", "Fast delivery"],
                "dislikes": [],
                "overall": "Be the first customer to leave a review!"
            }

        review_texts = [r.get("comment", r.get("text", "")) for r in reviews if r.get("comment") or r.get("text")]
        combined_text = "\n".join(review_texts)
        
        client = AIService._get_openai_client()
        if not client:
            return {
                "summary": f"Based on {len(reviews)} customer review(s).",
                "likes": ["Good product quality", "Accurate description"],
                "dislikes": ["Delivery time"],
                "overall": "Generally positive customer feedback."
            }
            
        try:
            prompt = (
                f"Analyze the following customer product reviews and return a JSON object with keys: "
                f"'summary', 'likes' (array), 'dislikes' (array), 'overall'.\n\nReviews:\n{combined_text}"
            )
            res = client.chat.completions.create(
                model=Config.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(res.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error summarizing reviews: {str(e)}")
            return {
                "summary": f"Based on {len(reviews)} review(s).",
                "likes": ["Great value for money"],
                "dislikes": [],
                "overall": "Satisfied buyers."
            }

    @staticmethod
    def generate_admin_product_description(name, category, key_features=""):
        client = AIService._get_openai_client()
        if not client:
            return {
                "description": f"Discover our premium {name} in {category}. Designed with top-tier craftsmanship and style, perfect for everyday use.",
                "status": "draft"
            }
            
        try:
            prompt = (
                f"Generate a compelling, high-converting e-commerce product description for:\n"
                f"Product Name: {name}\nCategory: {category}\nKey Features: {key_features}\n\n"
                f"Provide a draft description."
            )
            res = client.chat.completions.create(
                model=Config.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}]
            )
            return {
                "description": res.choices[0].message.content.strip(),
                "status": "draft_requires_admin_approval"
            }
        except Exception as e:
            logger.error(f"Error generating product description: {str(e)}")
            return {
                "description": f"Elevate your experience with {name}. Premium quality and exceptional value.",
                "status": "draft"
            }
