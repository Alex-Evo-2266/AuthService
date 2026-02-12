import { Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import { useAuth } from "./context/AuthContext";
import { AUTH_SERVICE_PREFIX } from "./const";
const { Header } = Layout;

export function HeaderComponent() {
  const location = useLocation()
  const { logout, user } = useAuth();

  return (
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
  );
}
