import type { MeData } from "../types";
import { api, setUserData } from "./axios";

export interface LoginForm {
  name: string;
  password: string;
}

export const useAuthAPI = () => {

    const me = async () => {
    const respMe = await api.get<MeData>("/sso/me");
    const d = {
      role: respMe.data.role.role_name,
      userId: respMe.data.user_id,
      privileges: respMe.data.role.privileges.map(i=>i.privilege.trim()),
    };
    setUserData(d);
    return d;
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
    setUserData(null);
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


