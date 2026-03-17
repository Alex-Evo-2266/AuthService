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
# 	data = jwt.decode(token,settings.SECRET_REFRESH_JWT_KEY,algorithms=[settings.ALGORITHM])
# 	if not('exp' in data and 'user_id' in data and data['sub'] == "refresh"):
# 		logger.warning(f"no data in jwt")
# 		raise InvalidRefrash("no data in jwt")
# 	if (datetime.now(settings.TIMEZONE) > datetime.fromtimestamp(data['exp'], settings.TIMEZONE)):
# 		logger.debug(f"outdated jwt")user
# 		raise ExpiredSignatureError("outdated jwt")
# 	u = await User.objects.get_or_none(id=data["user_id"])
# 	if not u:
# 		raise UserNotFoundException()
# 	old_token = await Session.objects.get_or_none(refresh=token)
# 	encoded_jwt = None
# 	if (not old_token):
# 		old_token2 = OldTokens.get_or_none(token)
# 		if not old_token2:
# 			raise InvalidRefrash("not found token")
# 		encoded_jwt = Tokens(expires_at=old_token2.expires_at, access=old_token2.new_access, refresh=old_token2.new_refresh)
# 	else:
# 		encoded_jwt = await create_tokens(u)
# 		OldTokens.add(old_token.refresh, old_token.access, encoded_jwt.refresh, encoded_jwt.access, encoded_jwt.expires_at)
# 		loop = asyncio.get_running_loop()
# 		loop.create_task(OldTokens.delete_delay(old_token.refresh, 10))
# 		old_token.access = encoded_jwt.access
# 		old_token.refresh = encoded_jwt.refresh
# 		old_token.expires_at = encoded_jwt.expires_at
# 		await old_token.update(["access", "refresh", "expires_at"])
# 	logger.info(f"login user: {u.name}, id: {u.id}")
# 	return encoded_jwt