import { createContext, useContext, useEffect, useState } from "react";
import { useAuthAPI, type LoginForm } from "../api/auth";
import type { AxiosResponse } from "axios";
import { setUserData } from "../api/axios";

export interface AuthData {
  userId: string;
  role: string;
  privileges: string[];
}

interface AuthContextType {
  user: AuthData | null;
  login: (data: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
}

const SMARTHOME_USER_DATA = "sh_auth_serv_user"

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthData | null>(null);
    const {login: apiLogin, logout:apiLogout} = useAuthAPI()

    const login = async (data: LoginForm) => {
        const u = await apiLogin(data);
        localStorage.setItem(SMARTHOME_USER_DATA, JSON.stringify({
            userId: u.userId, role:u.role, privileges: u.privileges
        }))
        setUser(u);
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem(SMARTHOME_USER_DATA)
        await apiLogout();
    };

    useEffect(()=>{
      const data = initState()
      setUser(data)
      if(!data){
        setUserData(null);
        // logout()
      }
    },[])

    const initState = ():AuthData | null => {
        let datauser = localStorage.getItem(SMARTHOME_USER_DATA)
        console.log(datauser)
        if (!datauser)
            return null
        const data = JSON.parse(datauser)
        let newdata: AuthData = {
            userId: data?.userId || undefined,
            role: data?.role || "",
            privileges: data?.privileges || [],
        }
        return newdata
    }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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