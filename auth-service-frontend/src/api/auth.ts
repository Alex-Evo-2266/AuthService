import type { AuthData, MeData } from "../types";
import { api } from "./axios";

export interface LoginForm {
  name: string;
  password: string;
}

export const useAuthAPI = () => {

    const me = async () => {
      try{
        const respMe = await api.get<MeData>("/sso/me");
        const d:AuthData = {
          role: respMe.data.role.role_name,
          userId: respMe.data.user_id,
          userName: respMe.data.user_name,
          privileges: respMe.data.role.privileges.map(i=>i.privilege.trim()),
        };
        return d;
      }
      catch{}
  }

  const login = async (data: LoginForm) => {
    const resp = await api.post("/sso/login", data);
    if(resp.status !== 200){
      throw new Error(resp.statusText)
    }
    return await me()
  };

  const logout = async () => {
    await api.get("/sso/logout");
  };

  const checkAuth = async () => {
    const resp = await api.get("/check");
    return {
      role: resp.headers["x-user-role"],
      userId: resp.headers["x-user-id"],
      privileges: resp.headers["x-user-privilege"]?.split(",") || [],
      token: resp.headers["authorization"]?.replace("Bearer ", "")
    };
  };
  return {
    login,
    logout,
    checkAuth,
    me
  }
}


