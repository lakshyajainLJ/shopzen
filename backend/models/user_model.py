def canonical_user(user_dict):
    if not user_dict:
        return None
    return {
        "id": str(user_dict.get("_id") or user_dict.get("id", "")),
        "name": user_dict.get("name", ""),
        "email": user_dict.get("email", ""),
        "role": user_dict.get("role", "user"),
        "created_at": user_dict.get("created_at")
    }
