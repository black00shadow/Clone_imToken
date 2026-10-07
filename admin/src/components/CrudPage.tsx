import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from 'antd';
import { crudApi } from '../api/client';

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'switch' | 'textarea';
  required?: boolean;
};

type Props = {
  title: string;
  resource: string;
  fields: Field[];
  columns: { title: string; dataIndex: string; render?: (v: unknown) => React.ReactNode }[];
};

export default function CrudPage({ title, resource, fields, columns }: Props) {
  const api = crudApi(resource);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      setData(await api.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: Record<string, unknown>) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing?.id) {
        await api.update(String(editing.id), values);
        message.success('수정됨');
      } else {
        await api.create(values);
        message.success('등록됨');
      }
      setOpen(false);
      load();
    } catch {
      message.error('저장 실패');
    }
  };

  const onDelete = async (id: string) => {
    try {
      await api.remove(id);
      message.success('삭제됨');
      load();
    } catch {
      message.error('삭제 실패');
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          등록
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          ...columns,
          {
            title: '작업',
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record as Record<string, unknown>)}>
                  수정
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => onDelete(String((record as { id: string }).id))}
                >
                  삭제
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? `${title} 수정` : `${title} 등록`}
        open={open}
        onOk={onSubmit}
        onCancel={() => setOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          {fields.map((f) => (
            <Form.Item
              key={f.name}
              name={f.name}
              label={f.label}
              valuePropName={f.type === 'switch' ? 'checked' : 'value'}
              rules={f.required ? [{ required: true }] : []}
            >
              {f.type === 'number' ? (
                <InputNumber style={{ width: '100%' }} />
              ) : f.type === 'switch' ? (
                <Switch />
              ) : f.type === 'textarea' ? (
                <Input.TextArea rows={4} />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
}
