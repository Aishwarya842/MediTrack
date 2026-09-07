from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers.auth import router as auth_router
from .routers.patients import router as patients_router
from .routers.clinical import (
    doctors_router, 
    appointments_router, 
    medicines_router, 
    prescriptions_router, 
    invoices_router
)

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MEDI TRACK - Hospital Information & RBAC System",
    description="Python FastAPI REST Backend with MySQL / SQLite integration for MEDI TRACK Hospital Management.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend UI connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all clinical and administrative routers
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(doctors_router)
app.include_router(appointments_router)
app.include_router(medicines_router)
app.include_router(prescriptions_router)
app.include_router(invoices_router)

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "MEDI TRACK Python HIMS Core",
        "version": "2.0.0",
        "database": "meditrack_db"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
