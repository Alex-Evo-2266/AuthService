import { useLocation } from "react-router-dom";
import { Layout, Menu, type MenuProps } from "antd";
import { useAuth } from "./context/AuthContext";
import { AUTH_SERVICE_PREFIX } from "./const";
const { Header } = Layout;



export function HeaderComponent() {
  const location = useLocation()
  const { logout, user } = useAuth();

  const items: MenuProps["items"] = [
    {
      key: `${AUTH_SERVICE_PREFIX}/users`,
      label: 'Пользователи'
    },
    {
      key: `${AUTH_SERVICE_PREFIX}/roles`,
      label: 'Роли'
    },
    {
      key: `${AUTH_SERVICE_PREFIX}/privileges`,
      label: 'Права'
    },
    {
      key: `${AUTH_SERVICE_PREFIX}/sessions`,
      label: 'Сессии'
    },
    {
      key: `${AUTH_SERVICE_PREFIX}/email-configs`,
      label: 'Конфиг email'
    },
    {
      onClick: logout,
      key: "key",
      label: "Выйти"
    }
  ]

  return (
      <Header>
        {user && <Menu items={items} theme="dark" mode="horizontal" selectedKeys={[location.pathname]}></Menu>}
      </Header>
  );
}
