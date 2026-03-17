from app.internal.auth.models.auth import Client
from typing import List, Optional
from app.internal.auth.schemas.client import ClientCreate, ClientUpdate, ClientCreateInit

from uuid import uuid4

# async def get_client(id:str)->Client | None:
# 	return await Client.objects.get_or_none(id=id)

# async def create_client(name:str, redirect_uri:str)->Client | None:
# 	return await Client.objects.create(name=name, redirect_uri=redirect_uri, id=uuid4().hex)


# async def delete_client(id:str)->None:
# 	return await Client.objects.delete(id=id)




async def create_client(data: ClientCreate) -> Client:
    client = Client(**data.model_dump(), id=uuid4().hex)
    await client.save()
    return client

async def create_client_init(data: ClientCreateInit) -> Client:
    client = Client(**data.model_dump())
    await client.save()
    return client

async def get_client(client_id: str) -> Optional[Client]:
    return await Client.objects.get_or_none(id=client_id)


async def get_clients() -> List[Client]:
    return await Client.objects.all()


async def update_client(client_id: str, data: ClientUpdate) -> Optional[Client]:
    client = await Client.objects.get_or_none(id=client_id)

    if not client:
        return None

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(client, key, value)

    await client.update()
    return client


async def delete_client(client_id: str) -> bool:
    client = await Client.objects.get_or_none(id=client_id)

    if not client:
        return False

    await client.delete()
    return True