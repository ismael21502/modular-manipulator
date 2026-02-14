# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.positions import router as positionsRouter
from api.sequences import router as sequencesRouter

def createApp() -> FastAPI:
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*", "http://localhost:5173", "http://localhost"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(positionsRouter)
    app.include_router(sequencesRouter)

    return app

app = createApp()
