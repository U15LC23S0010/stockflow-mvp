from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models
from auth import router as auth_router
from products import router as products_router
from dashboard import router as dashboard_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StockFlow API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "StockFlow API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}