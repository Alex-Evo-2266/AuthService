import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Roles from "./pages/Roles";
import Privileges from "./pages/Privileges";
import { ADD_USER, AUTH_SERVICE_PREFIX, EMAIL_CONFIG } from "./const";
import SessionPage from "./pages/Sessions";
import EmailConfigs from "./pages/ConfigEmail";

const { Header, Content } = Layout;


function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation()

  return (
    <Layout style={{ minHeight: "100vh", width: "100%" }}>
      <Header>
        <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
          {user && (
            <>
                <Menu.Item key={`${AUTH_SERVICE_PREFIX}/users`}>
                  <Link to={`${AUTH_SERVICE_PREFIX}/users`}>Пользователи</Link>
                </Menu.Item>

                <Menu.Item key={`${AUTH_SERVICE_PREFIX}/roles`}>
                  <Link to={`${AUTH_SERVICE_PREFIX}/roles`}>Роли</Link>
                </Menu.Item>

                <Menu.Item key={`${AUTH_SERVICE_PREFIX}/privileges`}>
                  <Link to={`${AUTH_SERVICE_PREFIX}/privileges`}>Права</Link>
                </Menu.Item>

                <Menu.Item key={`${AUTH_SERVICE_PREFIX}/sessions`}>
                  <Link to={`${AUTH_SERVICE_PREFIX}/sessions`}>Сессии</Link>
                </Menu.Item>

                <Menu.Item key={`${AUTH_SERVICE_PREFIX}/email-configs`}>
                  <Link to={`${AUTH_SERVICE_PREFIX}/email-configs`}>Конфиг email</Link>
                </Menu.Item>

                <Menu.Item key="logout" onClick={logout}>
                  Выйти
                </Menu.Item>
            </>
          )}
        </Menu>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Routes>
          {
            user?
            <>
              <Route path={`${AUTH_SERVICE_PREFIX}/users`} element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path={`${AUTH_SERVICE_PREFIX}/roles`} element={<ProtectedRoute><Roles /></ProtectedRoute>} />
              <Route path={`${AUTH_SERVICE_PREFIX}/privileges`} element={<ProtectedRoute><Privileges /></ProtectedRoute>} />
              <Route path={`${AUTH_SERVICE_PREFIX}/sessions`} element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
              {
                <Route path={`${AUTH_SERVICE_PREFIX}/users/add`} element={<ProtectedRoute prev={ADD_USER}><AddUser /></ProtectedRoute>} />
              }
              {
                <Route path={`${AUTH_SERVICE_PREFIX}/email-configs`} element={<ProtectedRoute prev={EMAIL_CONFIG}><EmailConfigs /></ProtectedRoute>} />
              }
              <Route path={`${AUTH_SERVICE_PREFIX}/*`} element={<Navigate replace to={`${AUTH_SERVICE_PREFIX}/users`} />} />
              <Route path="/*" element={<Navigate replace to={`${AUTH_SERVICE_PREFIX}/users`} />} />
            </>:
            <>
              <Route path={`${AUTH_SERVICE_PREFIX}/login`} element={<LoginPage />} />
              <Route path={`${AUTH_SERVICE_PREFIX}/*`} element={<Navigate replace to={`${AUTH_SERVICE_PREFIX}/login?next=${AUTH_SERVICE_PREFIX}/users`} />} />
              <Route path="/*" element={<Navigate replace to={`${AUTH_SERVICE_PREFIX}/login`} />} />
            </>
          }
        </Routes>
      </Content>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
