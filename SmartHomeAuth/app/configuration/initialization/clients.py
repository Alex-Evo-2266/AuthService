from app.internal.auth.logic.oauth.client import create_client_init, get_client
from app.internal.auth.schemas.client import ClientCreateInit
from app.configuration.settings import ID_SERVICES, AUTH_ID_SERVICE

def getClients():
    if not ID_SERVICES:
        return []
    return [item.strip() for item in ID_SERVICES.split(",")]

clients = [
    AUTH_ID_SERVICE,
    *(getClients())
]

async def initClients():
    for id in clients:
        try:
            if not await get_client(id):
                await create_client_init(ClientCreateInit(id=id, name=id, redirect_uri=""))
        except Exception as e:
            print(str(e))