from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MedFin API",
    version="1.0.0",
    docs_url="/docs"
)

# CORS MUST be declared immediately after app creation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://medfin-phi.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROOT-LEVEL HEALTH ENDPOINT (NOT IN A ROUTER)
@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}

# Import routers ONLY after health endpoint exists
from app.routers.cost_estimation import router as cost_router
from app.routers.insurance import router as insurance_router
from app.routers.bills import router as bills_router
from app.routers.navigation import router as navigation_router
from app.routers.assistance import router as assistance_router
from app.routers.payment_plans import router as payment_plans_router

app.include_router(cost_router, prefix="/api/v1")
app.include_router(insurance_router, prefix="/api/v1")
app.include_router(bills_router, prefix="/api/v1")
app.include_router(navigation_router, prefix="/api/v1")
app.include_router(assistance_router, prefix="/api/v1")
app.include_router(payment_plans_router, prefix="/api/v1")
