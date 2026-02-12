import { Outlet } from "react-router-dom";
import { Skeleton } from "antd";
import { useAuth } from "./context/AuthContext";

export function PublicGate() {
  const { loading } = useAuth();
  if (loading) return <Skeleton />;
  return <Outlet />;
}
