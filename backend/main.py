import logging
import time
import asyncio
import psutil
import os
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, ORJSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logging import setup_logging, get_request_id, get_correlation_id

setup_logging(settings.log_level)
logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_time = time.time()
    logger.info("Starting MedFin API", extra={"version": settings.app_version, "environment": settings.environment, "startup_time": datetime.now().isoformat()})
    yield
    logger.info("Shutting down MedFin API", extra={"uptime_seconds": time.time() - startup_time})


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Healthcare Financial Navigator API",
    docs_url="/docs",
    redoc_url="/redoc",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(GZipMiddleware, minimum_size=1000)

if settings.environment == "production":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["medfin.onrender.com", "localhost", "127.0.0.1"])


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.environment == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    correlation_id = get_correlation_id()
    request_id = get_request_id()
    start_time = time.time()
    request.state.correlation_id = correlation_id
    request.state.request_id = request_id
    logger.info("Request started", extra={"correlation_id": correlation_id, "request_id": request_id, "method": request.method, "url": str(request.url), "user_agent": request.headers.get("user-agent"), "client_ip": get_remote_address(request)})
    try:
        response = await call_next(request)
        logger.info("Request completed", extra={"correlation_id": correlation_id, "request_id": request_id, "status_code": response.status_code, "duration": round(time.time() - start_time, 3)})
        response.headers["X-Correlation-ID"] = correlation_id
        return response
    except Exception as exc:
        logger.error("Request failed", extra={"correlation_id": correlation_id, "request_id": request_id, "duration": round(time.time() - start_time, 3), "error": str(exc)}, exc_info=True)
        raise


# CORS added LAST so it wraps everything
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error("Unhandled exception", extra={"correlation_id": correlation_id, "request_id": request_id, "path": request.url.path, "method": request.method}, exc_info=True)
    return JSONResponse(status_code=500, content={"error": True, "code": "INTERNAL_ERROR", "message": "An internal error occurred.", "details": {"correlation_id": correlation_id, "request_id": request_id}})


@app.get("/")
async def root():
    return {"status": "ok", "service": settings.app_name, "version": settings.app_version}


@app.get("/health")
def health():
    return {"status": "healthy", "version": settings.app_version, "timestamp": datetime.now().isoformat()}


@app.get("/health/ready")
def readiness():
    return {"status": "ready", "environment": settings.environment, "timestamp": datetime.now().isoformat()}


@app.get("/health/live")
def liveness():
    try:
        process = psutil.Process(os.getpid())
        return {"status": "alive", "uptime": time.time() - process.create_time(), "memory_usage": process.memory_info().rss / 1024 / 1024, "cpu_percent": process.cpu_percent(), "timestamp": datetime.now().isoformat()}
    except Exception as exc:
        return JSONResponse(status_code=503, content={"status": "unhealthy", "error": str(exc)})


@app.get("/api/v1/status")
@limiter.limit("60/minute")
async def get_system_status(request: Request):
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    try:
        process = psutil.Process(os.getpid())
        uptime = time.time() - process.create_time()
        return {"status": "operational", "version": settings.app_version, "uptime": f"{uptime // 3600:.0f}h {(uptime % 3600) // 60:.0f}m", "environment": settings.environment, "metadata": {"correlation_id": correlation_id, "timestamp": datetime.now().isoformat()}}
    except Exception as exc:
        return JSONResponse(status_code=503, content={"status": "degraded", "error": "System status check failed"})


# Import and include ALL routers - DO NOT REMOVE ANY
from app.routers.cost_estimation import router as cost_router
from app.routers.insurance import router as insurance_router
from app.routers.bills import router as bills_router
from app.routers.navigation import router as navigation_router
from app.routers.assistance import router as assistance_router
from app.routers.payment_plans import router as payment_plans_router
from app.routers.feedback import router as feedback_router
from app.routers.ai import router as ai_router

app.include_router(cost_router, prefix="/api/v1")
app.include_router(insurance_router, prefix="/api/v1")
app.include_router(bills_router, prefix="/api/v1")
app.include_router(navigation_router, prefix="/api/v1")
app.include_router(assistance_router, prefix="/api/v1")
app.include_router(payment_plans_router, prefix="/api/v1")
app.include_router(feedback_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1/ai")
