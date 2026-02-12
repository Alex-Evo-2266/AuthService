import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "antd";
import { useAuth, usePrivilege } from "./context/AuthContext";
import { AUTH_SERVICE_PREFIX } from "./const";

export function PrivilegeGate({ privilege }: { privilege: string }) {
  const { loading } = useAuth();
  const allowed = usePrivilege(privilege);

  if (loading) return <Skeleton />;

  if (!allowed) {
    return (
      <Navigate
        replace
        to={`${AUTH_SERVICE_PREFIX}/users`}
      />
    );
  }

  return <Outlet />;
}
