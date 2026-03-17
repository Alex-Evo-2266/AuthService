import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Space, Modal, Form, Input } from "antd";
import { useClientsAPI } from "../api/clients"
import { usePrivilege } from "alex-evo-sh-auth";
import { EDIT_ROLE } from "../const"; // если нужен привилегия для редактирования
import type { Client } from "../types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null); // для редактирования
  const [form] = Form.useForm();

  const valid_privilege = usePrivilege(EDIT_ROLE);
  const { getClients, addClient, updateClient, deleteClient } = useClientsAPI();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const {data} = await getClients();
      setClients(data);
    } catch (err) {
      message.error("Ошибка загрузки клиентов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
      message.success("Клиент удалён");
      fetchClients();
    } catch {
      message.error("Не удалось удалить клиента");
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingClient(null);
    setIsModalVisible(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.setFieldsValue(client);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingClient) {
        await updateClient(editingClient.id, values);
        message.success("Клиент обновлён");
      } else {
        await addClient(values);
        message.success("Клиент добавлен");
      }
      setIsModalVisible(false);
      fetchClients();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      } else {
        message.error("Не удалось сохранить клиента");
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Имя", dataIndex: "name" },
    { title: "Redirect URI", dataIndex: "redirect_uri" },
    {
      title: "Действия",
      render: (_: unknown, record: Client) => (
        <Space>
          {valid_privilege && (
            <>
              <Button type="link" onClick={() => handleEdit(record)}>
                Редактировать
              </Button>
              <Popconfirm
                title="Удалить клиента?"
                onConfirm={() => handleDelete(record.id)}
              >
                <Button type="link" danger>
                  Удалить
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {valid_privilege && (
        <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
          Добавить клиента
        </Button>
      )}
      <Table loading={loading} columns={columns} dataSource={clients} rowKey="id" />

      <Modal
        title={editingClient ? "Редактировать клиента" : "Добавить клиента"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Имя"
            rules={[{ required: true, message: "Введите имя клиента" }]}
          >
            <Input placeholder="Название клиента" />
          </Form.Item>
          <Form.Item
            name="redirect_uri"
            label="Redirect URI"
            rules={[{ required: true, message: "Введите redirect URI" }]}
          >
            <Input placeholder="https://example.com/callback" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}