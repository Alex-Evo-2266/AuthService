from fastapi import APIRouter, Response, Request, Cookie
from fastapi.responses import JSONResponse

from app.internal.auth.logic.oauth.create_session import create_session
from app.internal.auth.logic.get_session import get_session_by_token
from app.internal.auth.logic.delete_session import delete_session
from app.internal.auth.logic.login import login_data_check
from app.internal.auth.logic.oauth.autorize import create_authtorize
from app.internal.auth.logic.oauth.client import get_client
from app.internal.auth.logic.oauth.refresh import get_refresh_token_data
from app.internal.user.models.user import User
from app.internal.auth.models.auth import AuthorizenCode
from app.internal.auth.schemas.oauth import LoginOAuth, LoginOAuthResponse, LogoutOAuth
from app.internal.auth.schemas.auth import Login
from app.configuration.settings import ROUTE_PREFIX
from typing import Optional

router = APIRouter(
    prefix=f"{ROUTE_PREFIX}/oauth",
	tags=["auth"],
	responses={404: {"description": "Not found"}},
)

@router.post("/login", response_model=LoginOAuthResponse)
async def login(data: LoginOAuth, request: Request, response:Response = Response("ok", 200)):
    user: User = await login_data_check(Login(name=data.name, password=data.password))

    ip = request.headers.get("x-forwarded-for")
    host=request.headers.get("host")
    session = await create_session(user, host, ip)
    response.set_cookie(
        key="smart_home_autorize", 
        value=session.access, 
        httponly=True, 
        path="/",
        secure=True,
        samesite="none"
    )

    client = await get_client(data.client_id)
    if(not client):
        return JSONResponse(status_code=404, content={"message": "client not found"})

    codeData:AuthorizenCode = await create_authtorize(data.redirect_uri, data.code_challenge, user, client, session)

    return LoginOAuthResponse(code=codeData.code)

@router.post("/logout")
async def login(data: LogoutOAuth, response:Response = Response("ok", 200), smart_home_autorize: Optional[str] = Cookie(None),  smart_home_refrash: Optional[str] = Cookie(None)):
    refrash = await get_refresh_token_data(smart_home_refrash, data.client_id)
    authtorize = await get_session_by_token(smart_home_autorize)
    if not authtorize:
        return JSONResponse({"detail": "unauthorized"}, status_code=401)
    
    response.delete_cookie("smart_home_autorize", 
                           path="/",
                           secure=True,
                           samesite="none")
    
    response.delete_cookie("smart_home_refrash", 
                           path="/",
                           secure=True,
                           samesite="none")
    
    await refrash.delete()
    await delete_session(authtorize.id)
