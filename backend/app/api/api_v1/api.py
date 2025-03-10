from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, projects, styles, ai, media

# Main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(styles.router, prefix="/styles", tags=["styles"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
