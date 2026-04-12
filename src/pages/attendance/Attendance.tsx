import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  DatePicker,
  Select,
  Row,
  Col,
  Typography,
  Spin,
  Result,
  Tag,
  message,
} from 'antd';
import {
  LoginOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { attendanceApi } from '../../api/attendance';
import { membersApi } from '../../api/members';
import { formatDateTime } from '../../utils/formatDate';
import type { AttendanceRecord } from '../../types/Attendance';
import type { Member } from '../../types/Member';
import type { ApiErrorResponse } from '../../types/ApiResponse';

const { Title } = Typography;

export default function Attendance() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedMemberId, setSelectedMemberId] = useState<number | undefined>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendance', date],
    queryFn: () => attendanceApi.getByDate(date),
  });

  const { data: membersData } = useQuery({
    queryKey: ['members-for-attendance'],
    queryFn: () => membersApi.getAll({ limit: 200 }),
  });

  const records: AttendanceRecord[] = data?.data?.data ?? [];
  const members: Member[] = membersData?.data?.data?.members ?? [];

  const checkInMutation = useMutation({
    mutationFn: (memberId: number) => attendanceApi.checkIn({ memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', date] });
      message.success('Checked in successfully');
      setSelectedMemberId(undefined);
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Check-in failed');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (memberId: number) => attendanceApi.checkOut(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', date] });
      message.success('Checked out successfully');
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      message.error(err.response?.data?.message ?? 'Check-out failed');
    },
  });

  const columns: ColumnsType<AttendanceRecord> = [
    { title: 'Member', dataIndex: 'member_name', key: 'member_name' },
    {
      title: 'Check In',
      dataIndex: 'check_in_time',
      key: 'check_in_time',
      render: (v: string) => formatDateTime(v),
    },
    {
      title: 'Check Out',
      dataIndex: 'check_out_time',
      key: 'check_out_time',
      render: (v: string | null) => (v ? formatDateTime(v) : <Tag color="blue">Still here</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: AttendanceRecord) => {
        if (record.check_out_time) return null;
        const isToday = date === dayjs().format('YYYY-MM-DD');
        if (!isToday) return null;
        return (
          <Button
            type="link"
            icon={<LogoutOutlined />}
            onClick={() => checkOutMutation.mutate(record.member_id)}
            loading={checkOutMutation.isPending}
          >
            Check Out
          </Button>
        );
      },
    },
  ];

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load attendance"
        extra={<Button onClick={() => refetch()}><ReloadOutlined /> Retry</Button>}
      />
    );
  }

  const isToday = date === dayjs().format('YYYY-MM-DD');

  return (
    <div>
      <Title level={4}>Attendance</Title>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <DatePicker
            value={dayjs(date)}
            onChange={(d) => setDate(d ? d.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))}
            style={{ width: '100%' }}
          />
        </Col>
        {isToday && (
          <>
            <Col xs={16} sm={8}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select member to check in"
                value={selectedMemberId}
                onChange={(val) => setSelectedMemberId(val as number)}
                style={{ width: '100%' }}
                options={members.map((m) => ({
                  label: `${m.name} (${m.member_code})`,
                  value: m.id,
                }))}
                allowClear
              />
            </Col>
            <Col xs={8} sm={4}>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                disabled={!selectedMemberId}
                loading={checkInMutation.isPending}
                onClick={() => {
                  if (selectedMemberId) checkInMutation.mutate(selectedMemberId);
                }}
              >
                Check In
              </Button>
            </Col>
          </>
        )}
      </Row>

      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          pagination={{ pageSize: 50 }}
        />
      </Spin>
    </div>
  );
}
