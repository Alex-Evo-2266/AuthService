import { Layout } from "antd";
import { Routes, Route, Navigate } from "react-router-dom";
import { HeaderComponent } from "./Header";
import { PublicGate } from "./PublicGate";
import { ProtectGate } from "./ProtectGate";
import { PrivilegeGate } from "./PrivilegeGate";
import {
  AUTH_SERVICE_PREFIX,
  ADD_USER,
  EMAIL_CONFIG,
} from "./const";

import LoginPage from "./pages/Login";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Privileges from "./pages/Privileges";
import SessionPage from "./pages/Sessions";
import AddUser from "./pages/AddUser";
import EmailConfigs from "./pages/ConfigEmail";

const { Content } = Layout;

export function AppLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderComponent />
      <Content style={{ padding: 24 }}>
        <Routes>
          {/* PUBLIC */}
          <Route element={<PublicGate />}>
            <Route
              path={`${AUTH_SERVICE_PREFIX}/login`}
              element={<LoginPage />}
            />
          </Route>

          {/* AUTH */}
          <Route element={<ProtectGate />}>
            <Route
              path={`${AUTH_SERVICE_PREFIX}/users`}
              element={<Users />}
            />
            <Route
              path={`${AUTH_SERVICE_PREFIX}/roles`}
              element={<Roles />}
            />
            <Route
              path={`${AUTH_SERVICE_PREFIX}/privileges`}
              element={<Privileges />}
            />
            <Route
              path={`${AUTH_SERVICE_PREFIX}/sessions`}
              element={<SessionPage />}
            />

            {/* PRIVILEGES */}
            <Route element={<PrivilegeGate privilege={ADD_USER} />}>
              <Route
                path={`${AUTH_SERVICE_PREFIX}/users/add`}
                element={<AddUser />}
              />
            </Route>

            <Route element={<PrivilegeGate privilege={EMAIL_CONFIG} />}>
              <Route
                path={`${AUTH_SERVICE_PREFIX}/email-configs`}
                element={<EmailConfigs />}
              />
            </Route>

            <Route
              path="*"
              element={<Navigate replace to={`${AUTH_SERVICE_PREFIX}/users`} />}
            />
          </Route>
        </Routes>
      </Content>
    </Layout>
  );
}
