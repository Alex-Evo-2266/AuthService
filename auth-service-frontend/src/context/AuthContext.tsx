import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuthAPI, type LoginForm } from "../api/auth";
import type { AxiosResponse } from "axios";
import type { AuthData } from "../types";

interface AuthContextType {
  user: AuthData | undefined;
  login: (data: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean
}

const SMARTHOME_USER_DATA = "sh_auth_serv_user"

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthData | undefined>(undefined);
    const [loading, setLoading] = useState(false)
    const {login: apiLogin, logout:apiLogout, me} = useAuthAPI()

    const login = async (data: LoginForm) => {
        const u = await apiLogin(data);
        if(u)
        {
          localStorage.setItem(SMARTHOME_USER_DATA, JSON.stringify({
              userId: u.userId, role:u.role, privileges: u.privileges, userName: u.userName
          }))
          setUser(u);
        }
    };

    const logout = async () => {
        setUser(undefined);
        localStorage.removeItem(SMARTHOME_USER_DATA)
        await apiLogout();
    };

    const load = useCallback(async()=>{
      setLoading(true)
      let data = initState()
      if(!data){
        data = await me()
      }
      setUser(data)
      setLoading(false)
    },[])

    useEffect(()=>{
      load()
    },[load])

    const initState = ():AuthData | undefined => {
        let datauser = localStorage.getItem(SMARTHOME_USER_DATA)
        if (!datauser)
            return undefined
        const data = JSON.parse(datauser)
        let newdata: AuthData = {
            userId: data?.userId || undefined,
            role: data?.role || "",
            userName: data?.userName,
            privileges: data?.privileges || [],
        }
        return newdata
    }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
};

export const usePrivilege = (privilege: string) => {
  const {user} = useAuth()

  return{
    valid_privilege: !!(user && user.privileges.includes(privilege))
  }
};

export const useErrorLogout = () => {
  const {logout} = useAuth()

  return <T, Y>(data:Promise<AxiosResponse<T, Y>>):Promise<AxiosResponse<T, Y>> => {
          return data.then(val=>{
              return val
          }).catch(err=>{
              if(err.status === 401)
                  logout()
              throw err
          })
      }
}