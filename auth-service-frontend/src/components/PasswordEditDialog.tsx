import { Modal, Form, Spin, message, Input } from "antd";
import { useState } from "react";
import { useUserAPI } from "../api/users";

export default function PasswordEditModal(
    { open, onClose, onSuccess }:{open: boolean, onClose:()=>void, onSuccess:()=>void}
) {
  const [form] = Form.useForm<{old: string, new: string}>();
  const [loading, setLoading] = useState(false);
  const {changePassword} = useUserAPI()

  const handleOk = async () => {
    try {
        setLoading(true)
        const values = await form.validateFields();
        await changePassword({
            old_password: values.old,
            new_password: values.new
        });
        message.success("Пользователь обновлен");
        setLoading(false)
        onSuccess();
        onClose();
    } catch (err) {
        message.error("Ошибка изменения Пользователя");
    }
  };

  return (
    <Modal
      open={open}
      title={`Изменить пароль`}
      onCancel={onClose}
      onOk={handleOk}
      okText="Сохранить"
      cancelText="Отмена"
    >
      {loading ? <Spin /> : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="old"
            label="Старый пароль"
            rules={[{ required: true, message: "Введите старый пароль" }]}
          >
            <Input placeholder="Введите старый пароль"/>
          </Form.Item>
          <Form.Item
            name="new"
            label="Новый пароль"
            rules={[{ required: true, message: "Введите новый пароль" }]}
          >
            <Input placeholder="Введите новый пароль"/>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}

