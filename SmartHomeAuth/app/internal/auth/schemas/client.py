from pydantic import BaseModel

class ClientCreate(BaseModel):
    name: str
    redirect_uri: str

class ClientCreateInit(ClientCreate):
    id: str

class ClientUpdate(BaseModel):
    name: str | None = None
    redirect_uri: str | None = None


class ClientRead(BaseModel):
    id: str
    name: str
    redirect_uri: str