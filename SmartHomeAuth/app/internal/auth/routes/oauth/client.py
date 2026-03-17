from fastapi import APIRouter, HTTPException

from typing import List
from app.configuration.settings import ROUTE_PREFIX
from app.internal.auth.schemas.client import ClientCreate, ClientUpdate, ClientRead

from app.internal.auth.logic.oauth.client import (
    create_client,
    get_client,
    get_clients,
    update_client,
    delete_client
)

router = APIRouter(
    prefix=f"{ROUTE_PREFIX}/clients",
	tags=["clients"],
	responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=ClientRead)
async def create(data: ClientCreate):
    return await create_client(data)


@router.get("/", response_model=List[ClientRead])
async def list_clients():
    return await get_clients()


@router.get("/{client_id}", response_model=ClientRead)
async def get(client_id: str):
    client = await get_client(client_id)

    if not client:
        raise HTTPException(404, "Client not found")

    return client


@router.patch("/{client_id}", response_model=ClientRead)
async def update(client_id: str, data: ClientUpdate):
    client = await update_client(client_id, data)

    if not client:
        raise HTTPException(404, "Client not found")

    return client


@router.delete("/{client_id}")
async def delete(client_id: str):
    deleted = await delete_client(client_id)

    if not deleted:
        raise HTTPException(404, "Client not found")

    return {"status": "deleted"}