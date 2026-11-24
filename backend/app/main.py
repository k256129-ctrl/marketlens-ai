from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.exceptions import register_exception_handlers
from app.seed import seed_initial_data
from app.api.routes import (
    auth,
    businesses,
    categories,
    dashboard,
    health,
    inventory,
    locations,
    products,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        settings.FRONTEND_URL.rstrip("/"),
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    prefix = settings.API_PREFIX
    app.include_router(health.router, prefix=prefix)
    app.include_router(auth.router)
    app.include_router(dashboard.router, prefix=prefix)
    app.include_router(categories.router, prefix=prefix)
    app.include_router(businesses.router, prefix=prefix)
    app.include_router(products.router, prefix=prefix)
    app.include_router(inventory.router, prefix=prefix)
    app.include_router(locations.router, prefix=prefix)
    prefix = settings.API_PREFIX
    app.include_router(health.router, prefix=prefix)
    app.include_router(auth.router)
    app.include_router(auth.router, prefix="/api")
    app.include_router(dashboard.router, prefix=prefix)
    app.include_router(categories.router, prefix=prefix)
    app.include_router(businesses.router, prefix=prefix)
    app.include_router(products.router, prefix=prefix)
    app.include_router(inventory.router, prefix=prefix)
    app.include_router(locations.router, prefix=prefix)

    # Guarantee /api/products & /api/inventory always work regardless of API_PREFIX
    if prefix != "/api":
        app.include_router(products.router, prefix="/api")
        app.include_router(inventory.router, prefix="/api")

    @app.get("/", tags=["Root"])
    def root():
        return {
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "online",
            "docs": "/docs",
        }

    return app


app = create_application()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=False)