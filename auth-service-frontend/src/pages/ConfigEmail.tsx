import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Space, Table, Typography, message } from "antd";
import type { ConfigItem, MessageData } from "../types";
import { useEmailConfigAPI } from "../api/emailConfig";
import TextArea from "antd/es/input/TextArea";

export const groupByTag = (arr: ConfigItem[]) => {
  return Object.values(
    arr.reduce((acc, obj) => {
      if (!acc[obj.tag]) acc[obj.tag] = [];
      acc[obj.tag].push(obj);
      return acc;
    }, {} as { [key: string]: ConfigItem[] })
  );
};

export default function EmailConfigs() {
    const [editedSettings, setEditedSettings] = useState<ConfigItem[]>([]);
    const { getEmailConfig, editEmailConfig, sendEmail } = useEmailConfigAPI();
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false)
    const [ModalEditVisible, setModalEditVisible] = useState<string | null>(null)
    const [form] = Form.useForm<{name: string, data: string}>();
    const [form2] = Form.useForm<MessageData>();


    const fetchPrivileges = async () => {
        setLoading(true);
        try {
            const {data} = await getEmailConfig();
            setEditedSettings(JSON.parse(JSON.stringify(data)));
        } catch (err) {
            message.error("Ошибка загрузки пользователей");
        } finally {
            setLoading(false);
        }
    };

    const handleModalOk = async () => {
      const values = await form2.validateFields();
      console.log(values)
      await sendEmail(values)
      form2.resetFields();
      setModalVisible(false)
    }

    const handleModalCancel = () => {
      form2.resetFields();
      setModalVisible(false)
    }

    const handleModalEditConfOk = async () => {
      const values = await form.validateFields();
      console.log(values)
      await editEmailConfig({[values.name]: values.data})
      form.resetFields();
      await fetchPrivileges()
      setModalEditVisible(null)
    }

    const handleModalEditConfCancel = () => {
      form.resetFields();
      setModalEditVisible(null)
    }

    const editDialogOpen = (name: string) => {
      const data = editedSettings.find(i=>i.key === name)
      if(!data) return
      form.setFields([
        {name: 'data', value: data.type === "password"?"":data?.value},
        {name: 'name', value: name}
      ])
      setModalEditVisible(name)
    }

    const openSendDialog = () => {
      form2.setFields([
        {name: 'subject', value: "test message"},
        {name: 'message', value: "test message"}
      ])
      setModalVisible(true)
    }

    useEffect(() => {
        fetchPrivileges();
    }, []);

    const columns = [
        { title: "KEY", dataIndex: "key" },
        { title: "тег", dataIndex: "tag" },
        { title: "type", dataIndex: "type" },
        { title: "значение", 
          render: (_:unknown, record: ConfigItem) => (
        <Space>
            {
              record.type === "password"?
              Array(parseInt(record.value)).fill("*").join(" "):
              record.value
            }
        </Space>
      )},{
        title: "Действие",
        render: (_:unknown, record: ConfigItem) => (
          <Typography.Link onClick={()=>{editDialogOpen(record.key)}}>Изменить</Typography.Link>
        )
      }
    ];

  return (
    <div>
      <Button onClick={openSendDialog} type="primary" htmlType="button" block>пробная отправка</Button>
        <Table
            loading={loading}
            columns={columns}
            dataSource={editedSettings}
            rowKey="id"
        />
        <Modal
        title="Изменить"
        visible={ModalEditVisible !== null}
        onOk={handleModalEditConfOk}
        onCancel={handleModalEditConfCancel}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="data"
            label={ModalEditVisible}
            rules={[{ required: true, message: "Введите значение" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            name="name"
            label={ModalEditVisible}
            style={{display: "none"}}
            rules={[{ required: true, message: "Введите значение" }]}
          ></Form.Item>
        </Form>
      </Modal>
        <Modal
        title="Отправить пробное сообщение"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form2} layout="vertical">
          <Form.Item
            name="email"
            label="Email получатель"
            rules={[{ required: true, message: "Введите email" }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            name="subject"
            label="subject"
            rules={[{ required: true, message: "Введите subject" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="message"
            label="текст"
            rules={[{ required: true, message: "Введите текст" }]}
          >
            <TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
