
from fastapi import FastAPI
import logging
from app.configuration.server import Server
from fastapi.middleware.cors import CORSMiddleware

def create_app(_=None) -> FastAPI:

    # logging.basicConfig(encoding='utf-8', level=logging.DEBUG)

    app = FastAPI()

    app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:1337", "https://localhost:1338"],  # фронт
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    return Server(app).get_app()