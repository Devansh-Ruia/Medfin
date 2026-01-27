import logging
import time
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from collections import defaultdict
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,  # Disable docs in production
    redoc_url="/redoc" if settings.debug else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Simple in-memory rate limiting
rate_limit_store = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = time.time()
    window = settings.rate_limit_window
    
    # Clean old requests
    rate_limit_store[client_ip] = [
        t for t in rate_limit_store[client_ip] if now - t < window
    ]
    
    if len(rate_limit_store[client_ip]) >= settings.rate_limit_requests:
        logger.warning(f"Rate limit exceeded for {client_ip}")
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."}
        )
    
    rate_limit_store[client_ip].append(now)
    response = await call_next(request)
    return response

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {duration:.3f}s")
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."}
    )

# Health checks
@app.get("/health")
def health():
    return {"status": "ok", "version": settings.app_version}

@app.get("/health/ready")
def readiness():
    """Readiness probe - check if app can serve traffic"""
    return {"status": "ready", "environment": settings.environment}

@app.get("/health/live")
def liveness():
    """Liveness probe - check if app is alive"""
    return {"status": "alive"}

# Import and include routers
from app.routers.cost_estimation import router as cost_router
from app.routers.insurance import router as insurance_router
from app.routers.bills import router as bills_router
from app.routers.navigation import router as navigation_router
from app.routers.assistance import router as assistance_router
from app.routers.payment_plans import router as payment_plans_router
from app.routers.feedback import router as feedback_router

app.include_router(cost_router, prefix="/api/v1")
app.include_router(insurance_router, prefix="/api/v1")
app.include_router(bills_router, prefix="/api/v1")
app.include_router(navigation_router, prefix="/api/v1")
app.include_router(assistance_router, prefix="/api/v1")
app.include_router(payment_plans_router, prefix="/api/v1")
app.include_router(feedback_router, prefix="/api/v1")

logger.info(f"🚀 {settings.app_name} v{settings.app_version} started in {settings.environment} mode")
