from utils.db import get_db

def test_cart_and_order_flow(client):
    # Setup admin user to create a product with stock = 10
    client.post("/register", json={"name": "Admin", "email": "admin2@example.com", "password": "pass"})
    db = get_db()
    db.users.update_one({"email": "admin2@example.com"}, {"$set": {"role": "admin"}})
    admin_token = client.post("/login", json={"email": "admin2@example.com", "password": "pass"}).get_json()["data"]["token"]

    prod_res = client.post("/products", json={
        "name": "Wireless Earbuds",
        "price": 1500,
        "stock": 10,
        "category": "Electronics"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    prod_id = prod_res.get_json()["data"]["id"]

    # Setup normal buyer
    client.post("/register", json={"name": "Buyer", "email": "buyer@example.com", "password": "buyerpass"})
    user_token = client.post("/login", json={"email": "buyer@example.com", "password": "buyerpass"}).get_json()["data"]["token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # 1. Add 2 earbuds to cart
    add_resp = client.post("/cart/add", json={"product_id": prod_id, "quantity": 2}, headers=user_headers)
    assert add_resp.status_code == 200
    cart_data = add_resp.get_json()["data"]
    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["quantity"] == 2

    # 2. Try to add 100 items (exceeding stock = 10) -> 400 Bad Request
    overflow_resp = client.post("/cart/add", json={"product_id": prod_id, "quantity": 100}, headers=user_headers)
    assert overflow_resp.status_code == 400

    # 3. Place order
    checkout_resp = client.post("/orders/place", json={
        "address": {"name": "Buyer", "line1": "123 Main St", "city": "Bengaluru", "pincode": "560001"},
        "payment_method": "UPI"
    }, headers=user_headers)
    assert checkout_resp.status_code == 201
    order_data = checkout_resp.get_json()["data"]
    assert order_data["items"][0]["price_snapshot"] == 1500
    assert order_data["subtotal"] == 3000

    # 4. Verify stock was deducted (10 - 2 = 8)
    p_check = db.products.find_one({"_id": db.products.find_one({"name": "Wireless Earbuds"})["_id"]})
    assert p_check["stock"] == 8

    # 5. Verify cart is cleared
    view_cart = client.get("/cart", headers=user_headers)
    assert len(view_cart.get_json()["data"]["items"]) == 0
