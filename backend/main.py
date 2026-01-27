import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logging.info("🚀 main.py is being executed")

app = FastAPI(
    title="MedFin API",
    version="1.0.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://medfin-phi.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "source": "main.py"
    }

# Import routers ONLY after health endpoint exists
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
