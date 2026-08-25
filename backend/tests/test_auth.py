def test_register_and_login(client):
    # 1. Register user
    reg_resp = client.post("/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert reg_resp.status_code == 201
    reg_data = reg_resp.get_json()
    assert reg_data["success"] is True
    assert "token" in reg_data["data"]
    assert reg_data["data"]["user"]["role"] == "user"

    # 2. Duplicate registration attempt
    dup_resp = client.post("/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert dup_resp.status_code == 409

    # 3. Successful login
    login_resp = client.post("/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    token = login_resp.get_json()["data"]["token"]

    # 4. Failed login - Wrong password
    wrong_pw_resp = client.post("/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    assert wrong_pw_resp.status_code == 401

    # 5. Access profile
    prof_resp = client.get("/profile", headers={"Authorization": f"Bearer {token}"})
    assert prof_resp.status_code == 200
    assert prof_resp.get_json()["data"]["email"] == "test@example.com"
