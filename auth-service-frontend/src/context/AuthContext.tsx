import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuthAPI, type LoginForm } from "../api/auth";
import type { AxiosResponse } from "axios";
import type { AuthData } from "../types";

interface AuthContextType {
  user?: AuthData;
  login: (data: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// const STORAGE_KEY = "sh_auth_serv_user";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthData | undefined>();
  const [loading, setLoading] = useState(true);

  const { login: apiLogin, logout: apiLogout, me } = useAuthAPI();

  // const restoreFromStorage = (): AuthData | undefined => {
  //   const raw = localStorage.getItem(STORAGE_KEY);
  //   if (!raw) return undefined;

  //   try {
  //     return JSON.parse(raw) as AuthData;
  //   } catch {
  //     return undefined;
  //   }
  // };

  const loadUser = useCallback(async () => {
    setLoading(true);

    // let data = restoreFromStorage();

    // if (!data) {
    let data = await me();
    // }

    // if (data) {
    //   localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // } else {
    //   localStorage.removeItem(STORAGE_KEY);
    // }

    setUser(data);
    setLoading(false);
  }, [me]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (form: LoginForm) => {
    setLoading(true);
    const data = await apiLogin(form);

    if (data) {
      // localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setUser(data);
    }

    setLoading(false);
  };

  const logout = async () => {
    setUser(undefined);
    // localStorage.removeItem(STORAGE_KEY);
    await apiLogout();
  };

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
  const { user } = useAuth();
  return !!user?.privileges?.includes(privilege);
};

export const useErrorLogout = () => {
  const { logout } = useAuth();

  return <T, Y>(req: Promise<AxiosResponse<T, Y>>) =>
    req.catch((err) => {
      if (err?.response?.status === 401) logout();
      throw err;
    });
};
