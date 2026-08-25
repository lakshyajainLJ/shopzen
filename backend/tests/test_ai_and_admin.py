from utils.db import get_db

def test_ai_and_admin_features(client):
    # Setup admin user
    client.post("/register", json={"name": "Admin AI", "email": "aiadmin@example.com", "password": "pass"})
    db = get_db()
    db.users.update_one({"email": "aiadmin@example.com"}, {"$set": {"role": "admin"}})
    admin_token = client.post("/login", json={"email": "aiadmin@example.com", "password": "pass"}).get_json()["data"]["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Test Recommendations
    rec_resp = client.get("/recommendations")
    assert rec_resp.status_code == 200
    assert "data" in rec_resp.get_json()

    # 2. Test AI Chat
    chat_resp = client.post("/ai/chat", json={
        "messages": [{"role": "user", "content": "Looking for formal shoes"}]
    })
    assert chat_resp.status_code == 200
    assert "reply" in chat_resp.get_json()["data"]

    # 3. Test Admin AI Description Generator
    gen_resp = client.post("/admin/ai/generate-description", json={
        "name": "Leather Oxford Shoes",
        "category": "Footwear",
        "key_features": "Genuine Italian leather"
    }, headers=admin_headers)
    assert gen_resp.status_code == 200
    assert "description" in gen_resp.get_json()["data"]
