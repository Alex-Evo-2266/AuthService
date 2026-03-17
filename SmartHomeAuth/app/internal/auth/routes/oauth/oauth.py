from fastapi import APIRouter, Response, Depends, Cookie
from fastapi.responses import RedirectResponse, JSONResponse
from app.internal.auth.logic.oauth.jwt import create_access_token
from app.internal.auth.logic.oauth.refresh import create_refresh_token_data, refresh_token
from app.internal.auth.logic.oauth.autorize import get_authtorize, create_authtorize
from app.internal.auth.logic.get_session import get_session_by_token
from app.configuration.settings import ROUTE_PREFIX, AUTH_FRONTEND
from app.internal.auth.schemas.oauth import CodeToToken, CodeToTokenResponse, RefreshOAuth, RefreshResponse
from app.internal.auth.models.auth import AuthorizenCode
from app.internal.auth.depends.auth import UserDepData, user_oauth_dep
from app.internal.auth.logic.oauth.client import get_client
from typing import Optional
from app.internal.role.logic.get_role import get_role_by_id
from app.internal.role.logic.get_privilege import get_privilege
from app.internal.role.serialization.map_role import map_role
from app.internal.auth.schemas.auth import MeSchems
import base64, hashlib, logging

logger = logging.getLogger(__name__)

router = APIRouter(
	prefix=f"{ROUTE_PREFIX}/oauth",
	tags=["auth"],
	responses={404: {"description": "Not found"}},
)

# Проверка соответствия
def verify_pkce(code_verifier, code_challenge)->bool:
	calculated_challenge = base64.urlsafe_b64encode(
		hashlib.sha256(code_verifier.encode()).digest()
	).decode().rstrip("=")
	
	return calculated_challenge == code_challenge

@router.get("/authorize")
async def authorize(client_id: str, redirect_uri: str, code_challenge: str, code_challenge_method: str, state: str, smart_home_autorize: Optional[str] = Cookie(None)):

	authtorize = await get_session_by_token(smart_home_autorize)
	if not authtorize:
		return RedirectResponse(
			f"{AUTH_FRONTEND}/authorize?client_id={client_id}&redirect_uri={redirect_uri}&code_challenge={code_challenge}&code_challenge_method={code_challenge_method}&state={state}"
			)
	client = await get_client(client_id)
	if(not client):
		return JSONResponse(status_code=404, content={"message": "client not found"})
	
	code = await create_authtorize(redirect_uri, code_challenge, authtorize.user, client, authtorize)
	
	return RedirectResponse(
		f"{redirect_uri}?code={code.code}&state={state}"
	)


@router.post("/token", response_model=CodeToTokenResponse)
async def token(data: CodeToToken, response:Response = Response("ok", 200)):
	autorize: AuthorizenCode | None = await get_authtorize(data.code, data.client_id)

	if not autorize:
		return JSONResponse(status_code=400, content={"message": "invalud data"})

	if not verify_pkce(data.code_verifier, autorize.code_challenge):
		return JSONResponse(status_code=400, content={"message": "invalud data"})
	
	access = create_access_token(autorize.user.id)
	(refresh, exp) = await create_refresh_token_data(autorize)

	response.set_cookie(
		key="smart_home_refrash", 
		value=refresh, 
		httponly=True, 
		path="/",
		secure=True,
		samesite="none"
	)

	return CodeToTokenResponse(access=access, user_id=autorize.user.id)


@router.get("/check")
async def token(response:Response = Response("ok", 200), userData:UserDepData = Depends(user_oauth_dep)):
	role = await get_role_by_id(userData.role.id)
	response.headers["X-Status-Auth"] = "ok"
	response.headers["X-User-Role"] = role.role_name
	response.headers["X-User-Privilege"]= ", ".join([privilege.privilege for privilege in await get_privilege(role)])
	response.headers["X-User-Id"]=userData.user.id
	return "ok"


@router.get("/me", response_model=MeSchems)
async def me(userData:UserDepData = Depends(user_oauth_dep)):

	role = await map_role(userData.role)
	
	return MeSchems(user_id=userData.user.id, user_name=userData.user.name, role=role)



@router.post("/refresh", response_model=RefreshResponse)
async def refrash(data:RefreshOAuth, response:Response = Response("ok", 200), smart_home_refrash: Optional[str] = Cookie(None)):
	try:

		if(not smart_home_refrash):
			return JSONResponse(status_code=401, content={"message": "invalid jwt"})
	
		(access, refrash, user) = await refresh_token(smart_home_refrash, data.client_id)

		response.set_cookie(key="smart_home_refrash", value=refrash, httponly=True)

		return RefreshResponse(access=access, user_id=user.id)
	except Exception as e:
		logger.error(str(e))
		return JSONResponse(status_code=400, content={"message": str(e)})
