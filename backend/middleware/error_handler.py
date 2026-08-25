from werkzeug.exceptions import HTTPException
from utils.response import error_response
from utils.logger import logger

def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        logger.error(f"HTTP exception: {e.code} - {e.description}")
        return error_response(
            code=e.name.upper().replace(" ", "_"),
            message=e.description,
            status_code=e.code
        )

    @app.errorhandler(Exception)
    def handle_unexpected_exception(e):
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return error_response(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred",
            status_code=500
        )
