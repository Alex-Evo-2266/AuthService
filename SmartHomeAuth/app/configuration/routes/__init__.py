from app.configuration.routes.routes import Routes

from app.internal.auth.routes import login, session, sso
from app.internal.role.routes import role, privilege
from app.internal.user.routes import user
from app.internal.auth.routes.oauth import oauth
from app.internal.auth.routes.oauth import login as oauthLogin
from app.internal.auth.routes.oauth import client

__routes__ = Routes(routers=(
        login.router,
        user.router,
        session.router,
        role.router,
        privilege.router,
        sso.router,
        oauthLogin.router,
        oauth.router,
        client.router
    ))

