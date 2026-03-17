import { Layout, Skeleton } from "antd";
import { Routes, Route, Navigate } from "react-router-dom";
import { HeaderComponent } from "./Header";
import {
  AUTH_SERVICE_PREFIX,
  ADD_USER,
  EMAIL_CONFIG,
} from "./const";

import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Privileges from "./pages/Privileges";
import SessionPage from "./pages/Sessions";
import AddUser from "./pages/AddUser";
import EmailConfigs from "./pages/ConfigEmail";
import AutorizePage from "./pages/Autorize";
import { CallbackPage, PrivilegeGate, ProtectGate } from "alex-evo-sh-auth";
import ClientsPage from "./pages/Clients";

const { Content } = Layout;

export function AppLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderComponent />
      <Content style={{ padding: 24 }}>
        <Routes>
          {/* PUBLIC */}
          <Route
            path={`${AUTH_SERVICE_PREFIX}/authorize`}
            element={<AutorizePage />}
          />
          <Route
            path={`${AUTH_SERVICE_PREFIX}/callback`}
            element={<CallbackPage/>}
          />

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
            <Route
              path={`${AUTH_SERVICE_PREFIX}/clients`}
              element={<ClientsPage />}
            />

            {/* PRIVILEGES */}
            <Route element={<PrivilegeGate 
                  privilege={ADD_USER} 
                  loadingPage={<Skeleton/>}
                  invalidPage={<Navigate
                    replace
                    to={`${AUTH_SERVICE_PREFIX}/users`}
                  />}
                />}
                >
              <Route
                path={`${AUTH_SERVICE_PREFIX}/users/add`}
                element={<AddUser />}
              />
            </Route>

            <Route element={<PrivilegeGate 
            privilege={EMAIL_CONFIG} 
            loadingPage={<Skeleton/>}
            invalidPage={<Navigate
                    replace
                    to={`${AUTH_SERVICE_PREFIX}/users`}
                  />}
                  />}
                  >
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
