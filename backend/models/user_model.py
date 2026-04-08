def user_schema(user):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"]
    }
