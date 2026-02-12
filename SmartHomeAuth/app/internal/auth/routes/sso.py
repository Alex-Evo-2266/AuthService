import logging
from app.configuration.settings import ROUTE_PREFIX

from fastapi import APIRouter, Response, Depends, Request
from fastapi.responses import JSONResponse

from app.internal.auth.logic.login import login_data_check
from app.internal.auth.logic.create_session import create_session
from app.internal.auth.logic.get_session import get_token
from app.internal.auth.logic.delete_session import delete_session
from app.internal.role.logic.get_privilege import get_privilege
from app.internal.auth.schemas.auth import Login, MeSchems
from app.internal.auth.schemas.depends import SessionDepData
from app.internal.auth.depends.auth import session_dep_sso
from app.internal.role.logic.get_role import get_role_by_id
from app.internal.role.serialization.map_role import map_role
from app.internal.auth.logic.verify_access import verify_or_refresh_session
from app.internal.auth.exceptions.access import InvalidAccess

logger = logging.getLogger(__name__)

router = APIRouter(
	prefix=f"{ROUTE_PREFIX}/sso",
	tags=["auth"],
	responses={404: {"description": "Not found"}},
)

def get_real_host(request: Request) -> str:
    # 1️⃣ если запрос пришёл через proxy (Traefik / Nginx)
    forwarded_host = request.headers.get("x-forwarded-host")
    if forwarded_host:
        return forwarded_host.split(",")[0].strip()

    # 2️⃣ если proxy не используется
    if request.client:
        return request.client.host

    # 3️⃣ крайний fallback
    return "unknown"


@router.post("/login")
async def login(
    request: Request,
    response: Response,
    data: Login
):
    user = await login_data_check(data)
    real_host = get_real_host(request)
    session = await create_session(user, real_host)
    tokens = await get_token(session)

    role = await get_role_by_id(user.role.id)

    response.set_cookie(
        key="smart_home_refresh_sso",
        value=tokens.refresh,
        httponly=True,
        secure=True,
        samesite="none",
        path="/"
    )

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

@router.get("/check")
async def check_user(request: Request):
    access = request.cookies.get("smart_home_access_sso")
    refresh = request.cookies.get("smart_home_refresh_sso")


    if not access and not refresh:
        return JSONResponse({"detail": "unauthorized"}, status_code=401)
    
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
    response.delete_cookie("smart_home_access_sso", 
                           path="/",
                           secure=True,
                           samesite="none")
    response.delete_cookie("smart_home_refresh_sso", 
                           path="/",
                           secure=True,
                           samesite="none")
    await delete_session(userData.session.id)
    return "ok"

@router.get("/me", response_model=MeSchems)
async def me(userData: SessionDepData = Depends(session_dep_sso)):

    role = await map_role(userData.role)
    
    return MeSchems(user_id=userData.user.id, user_name=userData.user.name, role=role)