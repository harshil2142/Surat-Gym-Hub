import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  DatePicker,
  Form,
  TimePicker,
  Typography,
  Tag,
  Space,
  Spin,
  Result,
  message,
  Row,
  Col,
  Modal,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { trainersApi } from '../../../api/trainers';
import { SlotStatus } from '../../../types/enums';
import type { TrainerSlot, CreateSlotRequest } from '../../../types/Trainer';
import type { ApiErrorResponse } from '../../../types/ApiResponse';

const { Title, Text } = Typography;

interface SlotManagerProps {
  trainerId: number;
}

const STATUS_COLORS: Record<string, string> = {
  [SlotStatus.AVAILABLE]: 'green',
  [SlotStatus.BOOKED]: 'blue',
  [SlotStatus.BLOCKED]: 'red',
};

export default function SlotManager({ trainerId }: SlotManagerProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  const formattedDate = selectedDate.format('YYYY-MM-DD');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['trainer-slots', trainerId, formattedDate],
    queryFn: () => trainersApi.getSlots(trainerId, formattedDate),
  });

  const slots: TrainerSlot[] = data?.data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: CreateSlotRequest) => trainersApi.createSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-slots', trainerId] });
      message.success('Slot created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Failed to create slot');
    },
  });

  const columns: ColumnsType<TrainerSlot> = [
    {
      title: 'Time',
      key: 'time',
      render: (_: unknown, record: TrainerSlot) => (
        <Text strong>
          {record.start_time.slice(0, 5)} - {record.end_time.slice(0, 5)}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>
      ),
    },
  ];

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load slots"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Text>Select Date: </Text>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || dayjs())}
              allowClear={false}
            />
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Slot
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin /></div>
      ) : (
        <Table
          columns={columns}
          dataSource={slots}
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'No slots found for this date.' }}
        />
      )}

      {/* Create Slot Modal */}
      <Modal
        title={
          <Space>
            <span>Add Slot for</span>
            <Tag color="geekblue">{formattedDate}</Tag>
          </Space>
        }
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          style={{ marginTop: 24 }}
          onFinish={(values) => {
            createMutation.mutate({
              trainerId: trainerId,
              slotDate: formattedDate,
              startTime: values.timeRange[0].format('HH:mm:ss'),
              endTime: values.timeRange[1].format('HH:mm:ss'),
            });
          }}
        >
          <Form.Item
            name="timeRange"
            label="Slot Time Range"
            rules={[{ required: true, message: 'Please select start and end time' }]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
