import { Config } from "alex-evo-sh-auth"
import { API_AUTH, BASE_KEY_STORAGE, AUTH_ID_SERVICE } from "./consts"

export const authConfig = new Config(
    API_AUTH, 
    AUTH_ID_SERVICE, 
    window.location.origin + "/auth-service/callback", 
    "/auth-service/users", 
    BASE_KEY_STORAGE
)



// "2c72d754085341f88f9d5d0a3e7f28f9"