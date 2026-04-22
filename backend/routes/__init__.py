from fastapi import APIRouter

from backend.routes.funds import router as funds_router
from backend.routes.chat import router as chat_router

router = APIRouter()

router.include_router(funds_router)
router.include_router(chat_router)


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
