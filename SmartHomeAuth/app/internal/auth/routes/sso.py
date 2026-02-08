from asyncio.log import logger
import json, logging
from app.configuration.settings import ROUTE_PREFIX, MODULES_COOKIES_NAME, TIMEZONE

from fastapi import APIRouter, Response, Cookie, Depends, Header, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from typing import Optional, Annotated

from app.internal.exceptions.base import InvalidInputException
from app.internal.auth.logic.login import login_data_check
from app.internal.auth.logic.create_session import create_session
from app.internal.auth.logic.get_session import get_token
from app.internal.auth.logic.delete_session import delete_session
from app.internal.auth.logic.refresh import refresh_token
from app.internal.role.logic.get_privilege import get_privilege
from app.internal.auth.models.auth import Session
from app.internal.auth.schemas.auth import Login, LoginHeaders, TempTokenData, MeSchems
from app.internal.auth.schemas.depends import SessionDepData
from app.internal.auth.depends.auth import session_dep_sso
from app.internal.role.logic.get_role import get_role_by_id
from app.internal.role.serialization.map_role import map_role
from app.internal.auth.logic.verify_access import verify_or_refresh_session
from app.internal.auth.exceptions.access import AccessExpired, InvalidAccess

logger = logging.getLogger(__name__)

router = APIRouter(
	prefix=f"{ROUTE_PREFIX}/sso",
	tags=["auth"],
	responses={404: {"description": "Not found"}},
)

@router.post("/login")
async def login(
    headers: Annotated[LoginHeaders, Header()],
    response: Response,
    data: Login
):
    user = await login_data_check(data)
    session = await create_session(user, headers.Host)
    tokens = await get_token(session)

    role = await get_role_by_id(user.role.id)

    # refresh (как было)
    response.set_cookie(
        key="smart_home_refrash_sso",
        value=tokens.refresh,
        httponly=True,
        secure=True,
        samesite="strict",
        path="/"
    )

    # ✅ access (НОВОЕ)
    response.set_cookie(
        key="smart_home_access_sso",
        value=tokens.access,
        httponly=True,
        secure=True,
        samesite="none",
        path="/"
    )

    # headers можно оставить (не ломает старые сценарии)
    response.headers["X-User-Role"] = role.role_name
    response.headers["X-User-Id"] = str(user.id)
    response.headers["X-Status-Auth"] = "ok"

    return "ok"


@router.get("/refresh")
async def refresh(
    request: Request,
    smart_home: Optional[str] = Cookie(None)
):
    next_url = request.query_params.get("next", "/")

    if not smart_home:
        return RedirectResponse(
            f"/auth/sso/login?next={next_url}",
            status_code=302
        )

    tokens = await refresh_token(smart_home)

    response = RedirectResponse(next_url)

    response.set_cookie(
        key="smart_home_access_sso",
        value=tokens.access,
        httponly=True,
        secure=True,
        samesite="none",
        path="/"
    )

    response.set_cookie(
        key="smart_home_refrash_sso",
        value=tokens.refresh,
        httponly=True,
        secure=True,
        samesite="strict",
        path="/"
    )

    return response

# def is_api_request(request: Request) -> bool:
#     accept = request.headers.get("accept", "")
#     return (
#         "application/json" in accept
#         or request.headers.get("x-requested-with") == "fetch"
#         or request.url.path.startswith("/api/")
#     )

def is_api_request(request: Request) -> bool:
    accept = request.headers.get("accept", "").lower()

    if request.url.path.startswith("/api/"):
        return True

    if "application/json" in accept:
        return True

    return False


# @router.get("/check")
# async def check_user(request: Request, response: Response):
#     access = request.cookies.get("smart_home_access_sso")
#     refrash = request.cookies.get("smart_home_refrash_sso")
#     forwarded_uri = request.headers.get("X-Forwarded-Uri", "/")
#     is_api = is_api_request(request)

#     if not access:
#         if is_api:
#             return JSONResponse(
#                 {"detail": "unauthorized"},
#                 status_code=403
#             )
#         return RedirectResponse(
#             f"/auth-service/login?next={forwarded_uri}",
#             status_code=302
#         )

#     try:
#         session = await verify_or_refresh_session(access, refrash, response)
#         role = await get_role_by_id(session.user.role.id)

#     except AccessExpired:
#         if is_api:
#             return JSONResponse(
#                 {"detail": "access_expired"},
#                 status_code=401
#             )
#         return RedirectResponse(
#             f"/api-auth/sso/refresh?next={forwarded_uri}",
#             status_code=302
#         )

#     except InvalidAccess:
#         if is_api:
#             return JSONResponse(
#                 {"detail": "invalid_access"},
#                 status_code=403
#             )
#         return RedirectResponse(
#             f"/auth-service/login?next={forwarded_uri}",
#             status_code=302
#         )

#     response = Response("ok", status_code=200)
#     response.headers["X-User-Id"] = str(session.user.id)
#     response.headers["X-User-Role"] = role.role_name
#     response.headers["X-User-Privilege"] = ", ".join(
#         p.privilege for p in await get_privilege(role)
#     )
#     response.headers["X-Status-Auth"] = "ok"

#     return response

def _unauthorized(is_api: bool, next_url: str):
    if is_api:
        return JSONResponse({"detail": "unauthorized"}, status_code=401)

    return RedirectResponse(
        f"/auth-service/login?next={next_url}",
        status_code=302,
    )


@router.get("/check")
async def check_user(request: Request):
    forwarded_uri = request.headers.get("X-Forwarded-Uri", "/")
    access = request.cookies.get("smart_home_access_sso")
    refresh = request.cookies.get("smart_home_refrash_sso")


    if not access:
        return JSONResponse({"detail": "unauthorized"}, status_code=401)
        # return _unauthorized(is_api, forwarded_uri)
    
    response = JSONResponse(
        content={"status": "ok"},
        status_code=200
    )

    try:
        session = await verify_or_refresh_session(
            access=access,
            refresh=refresh,
            response=response,
        )


    except InvalidAccess:
        return JSONResponse({"detail": "unauthorized"}, status_code=401)
        # return _unauthorized(is_api, forwarded_uri)

    except Exception as e:
        return JSONResponse({"detail": "forbidden"}, status_code=403)

    role = await get_role_by_id(session.user.role.id)
    response.headers.update({
        "X-User-Id": str(session.user.id),
        "X-User-Role": role.role_name,
        "X-User-Privilege": ", ".join(
            p.privilege for p in await get_privilege(role)
        ),
        "X-Status-Auth": "ok",
    })

    return response


@router.get("/logout")
async def logout(response: Response, userData: SessionDepData = Depends(session_dep_sso)):
    response.delete_cookie("smart_home_access_sso", path="/")
    response.delete_cookie("smart_home_refrash_sso", path="/auth/sso/refresh")
    await delete_session(userData.session.id)
    return "ok"

@router.get("/me", response_model=MeSchems)
async def me(userData: SessionDepData = Depends(session_dep_sso)):

    role = await map_role(userData.role)
    
    return MeSchems(user_id=userData.user.id, user_name=userData.user.name, role=role)