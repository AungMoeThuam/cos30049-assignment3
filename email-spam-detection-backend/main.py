from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router as api_router
from app.models import classifier

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models into memory
    classifier.load_models()
    yield

app = FastAPI(title="Email Spam Detection API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "backend app"}

app.include_router(api_router, prefix="/api/v1")
