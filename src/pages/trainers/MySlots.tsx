import { Typography, Card, Result, Button } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import SlotManager from './components/SlotManager';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function MySlots() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If for some reason the user doesn't have a trainerId but managed to reach this page
  if (!user?.trainerId) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You do not have an associated Trainer profile to manage slots."
        extra={<Button type="primary" onClick={() => navigate('/')}>Back Home</Button>}
      />
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        My Slots
      </Title>
      
      <Card>
        <SlotManager trainerId={user.trainerId} />
      </Card>
    </div>
  );
}
