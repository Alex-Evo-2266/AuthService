import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Skeleton } from "antd";
import { useAuth } from "./context/AuthContext";
import { AUTH_SERVICE_PREFIX } from "./const";

export function ProtectGate() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Skeleton />;

  if (!user) {
    const next = encodeURIComponent(
      location.pathname + location.search + location.hash
    );

    return (
      <Navigate
        replace
        to={`${AUTH_SERVICE_PREFIX}/login?next=${next}`}
      />
    );
  }

  return <Outlet />;
}
