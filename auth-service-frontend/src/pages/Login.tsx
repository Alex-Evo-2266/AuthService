import { Form, Input, Button, Card, message, Skeleton } from "antd";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AUTH_SERVICE_PREFIX } from "../const";
import { useEffect } from "react";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams()

  const next = searchParams.get("next") || `${AUTH_SERVICE_PREFIX}/users`;

  const onFinish = async (values: { name: string; password: string }) => {
    try {
      await login(values);
      message.success("Успешный вход");
      navigate(next, {replace: true});
    } catch {
      message.error("Неверное имя или пароль");
    }
  };

  useEffect(()=>{
    if(!loading && user)
    {
      navigate(next, {replace: true})
    }
  },[user, next, navigate, loading])  

  if (loading || user) {
    return <Skeleton/>; 
  }

  return (
    <Card title="Вход" style={{ maxWidth: 400, margin: "100px auto" }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Имя" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Войти
        </Button>
      </Form>
    </Card>
  );
}
