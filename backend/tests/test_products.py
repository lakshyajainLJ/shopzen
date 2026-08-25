from utils.db import get_db

def test_product_crud_and_rbac(client):
    # 1. Register admin user & elevate role in DB
    client.post("/register", json={
        "name": "Admin User",
        "email": "admin@example.com",
        "password": "adminpassword"
    })
    db = get_db()
    db.users.update_one({"email": "admin@example.com"}, {"$set": {"role": "admin"}})

    # Login to get admin token
    admin_login = client.post("/login", json={
        "email": "admin@example.com",
        "password": "adminpassword"
    })
    admin_token = admin_login.get_json()["data"]["token"]

    # Register normal user
    client.post("/register", json={
        "name": "Normal User",
        "email": "normal@example.com",
        "password": "normalpassword"
    })
    user_login = client.post("/login", json={
        "email": "normal@example.com",
        "password": "normalpassword"
    })
    user_token = user_login.get_json()["data"]["token"]

    # 2. Normal user tries to create product -> 403 Forbidden
    unauth_create = client.post("/products", json={
        "name": "Hacker Shirt", "price": 999
    }, headers={"Authorization": f"Bearer {user_token}"})
    assert unauth_create.status_code == 403

    # 3. Admin creates product -> 201 Created
    create_resp = client.post("/products", json={
        "name": "Classic Denim Jacket",
        "price": 1999,
        "category": "Clothing",
        "stock": 50,
        "description": "Stylish jacket"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert create_resp.status_code == 201
    prod_data = create_resp.get_json()["data"]
    prod_id = prod_data["id"]

    # 4. Get products list
    list_resp = client.get("/products?category=Clothing")
    assert list_resp.status_code == 200
    assert len(list_resp.get_json()["data"]["products"]) == 1

    # 5. Admin updates product
    update_resp = client.put(f"/products/{prod_id}", json={
        "price": 2499
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert update_resp.status_code == 200
    assert update_resp.get_json()["data"]["price"] == 2499

    # 6. Admin deletes product
    del_resp = client.delete(f"/products/{prod_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert del_resp.status_code == 200
