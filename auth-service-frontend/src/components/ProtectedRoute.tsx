// import { Navigate } from "react-router-dom";
// import { usePrivilege } from "../context/AuthContext";
// import { AUTH_SERVICE_PREFIX } from "../const";

// export default function ProtectedRoute({ children, prev = undefined }: { children: React.ReactNode, prev?: string }) {
//   const { valid_privilege } = usePrivilege(prev || "");

//   if (prev !== undefined && !valid_privilege)
//     return <Navigate to={`${AUTH_SERVICE_PREFIX}/users`} replace />;
//   return children;
// }
