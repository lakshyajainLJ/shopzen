from flask import jsonify

def success_response(data=None, message=None, status_code=200):
    payload = {"success": True}
    if data is not None:
        payload["data"] = data
    if message is not None:
        payload["message"] = message
    return jsonify(payload), status_code

def error_response(code="ERROR", message="An error occurred", status_code=400, details=None):
    error_payload = {
        "code": code,
        "message": message
    }
    if details:
        error_payload["details"] = details
    return jsonify({
        "success": False,
        "error": error_payload
    }), status_code
