import { Navigate, useLocation } from "react-router-dom";
import { useAuth, usePrivilege } from "../context/AuthContext";
import { AUTH_SERVICE_PREFIX } from "../const";

export default function ProtectedRoute({ children, prev = undefined }: { children: React.ReactNode, prev?: string }) {
  const { user } = useAuth();
  const { valid_privilege } = usePrivilege(prev || "");
  const location = useLocation();
  if (!user) {
    const next =
      location.pathname + location.search + location.hash;
    return <Navigate to={`${AUTH_SERVICE_PREFIX}/login?next=${encodeURIComponent(next)}`} replace />;
  }
  if (prev !== undefined && !valid_privilege)
    return <Navigate to={`${AUTH_SERVICE_PREFIX}/users`} replace />;
  return children;
}
