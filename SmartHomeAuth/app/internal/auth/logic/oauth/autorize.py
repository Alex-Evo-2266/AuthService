from app.internal.auth.models.auth import AuthorizenCode, Client, User, Session
from uuid import uuid4
from datetime import datetime
from app.configuration import settings

async def get_authtorize(code:str, client_id:str)->AuthorizenCode | None:
	return await AuthorizenCode.objects.get_or_none(code=code, client__id=client_id)

async def create_authtorize(
	redirect_uri: str,
	code_challenge: str,
	user: User,
	client: Client,
	session: Session
	):
	return await AuthorizenCode.objects.create(session=session , code=uuid4().hex, id=uuid4().hex, expires_at=datetime.now(settings.TIMEZONE), redirect_uri=redirect_uri, code_challenge=code_challenge, user=user, client=client)