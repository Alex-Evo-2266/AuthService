from app.internal.auth.models.auth import RefreshData, AuthorizenCode
from app.internal.auth.logic.oauth.jwt import create_refresh_token, decode_token, create_access_token
from app.internal.exceptions.base import InvalidInputException
from uuid import uuid4


async def create_refresh_token_data(autorize: AuthorizenCode)->tuple[str, RefreshData]:
	(token, exp) = create_refresh_token(autorize.user.id)
	refresh = RefreshData(token=token, expires_at=exp, id=uuid4().hex, user=autorize.user, client=autorize.client, session=autorize.session)
	await refresh.save()
	return (token, refresh)

async def get_refresh_token_data(token:str, client_id:str)->None | RefreshData:
	refresh_data: RefreshData | None = await RefreshData.objects.get_or_none(token=token, client__id=client_id)
	return refresh_data

async def refresh_token(token:str, client_id:str):
	decode_token(token)
	refresh_data: RefreshData | None = await RefreshData.objects.get_or_none(token=token, client__id=client_id)

	if not refresh_data:
		raise InvalidInputException("no data in jwt") 

	await refresh_data.user.load()
	(refresh, exp) = create_refresh_token(refresh_data.user.id)
	access = create_access_token(refresh_data.user.id)

	refresh_data.expires_at = exp
	refresh_data.token = refresh

	await refresh_data.update(_columns=["expires_at", "token"])

	return (access, refresh, refresh_data.user)
