import { Form, Input, Button, Card, message } from "antd";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/axios";
// import { useSearchParams } from "react-router-dom";

export default function AutorizePage() {
  const [searchParams] = useSearchParams()

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  console.log(searchParams)

  const onFinish = async (values: { name: string; password: string }) => {
    try {

      const resp = await api.post<{code: string}>("/oauth/login", {
        name: values.name,
        password: values.password,
        client_id: clientId,
        redirect_uri: redirectUri,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod
      });

      const data = resp.data;

      // redirect обратно в сервис
      window.location.href =
        `${redirectUri}?code=${data.code}&state=${state}`;

    } catch(e) {
      message.error("Неверное имя или пароль");
      console.error(e)
    }
  };



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
