import React, { useState } from 'react';
import { Card, Typography, Button, List, Badge, Space, message } from 'antd';
import { 
  ShoppingOutlined, 
  TagOutlined, 
  ThunderboltOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface NotificationItem {
  id: string;
  type: 'order' | 'offer' | 'price' | 'info';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

const Notifications: React.FC = () => {
  const [data, setData] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered',
      description: 'Your order #ORD-2024-001 has been delivered successfully.',
      timestamp: '2 hours ago',
      isRead: false,
    },
    {
      id: '2',
      type: 'offer',
      title: 'Special Offer',
      description: 'Get 20% off on your next purchase. Use code: SAVE20',
      timestamp: '1 day ago',
      isRead: false,
    },
    {
      id: '3',
      type: 'order',
      title: 'Order Shipped',
      description: 'Your order #ORD-2024-002 has been shipped and is on its way.',
      timestamp: '2 days ago',
      isRead: true,
    },
    {
      id: '4',
      type: 'price',
      title: 'Price Drop',
      description: 'An item from your wishlist is now on sale!',
      timestamp: '3 days ago',
      isRead: true,
    },
  ]);

  const markAllRead = () => {
    setData(prev => prev.map(item => ({ ...item, isRead: true })));
    message.success('All notifications marked as read');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <div className="icon-box order"><ShoppingOutlined /></div>;
      case 'offer': return <div className="icon-box offer"><TagOutlined /></div>;
      case 'price': return <div className="icon-box price"><ThunderboltOutlined /></div>;
      default: return <div className="icon-box info"><InfoCircleOutlined /></div>;
    }
  };

  return (
    <Card className="notifications-card" bordered={false}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Title level={3} className="section-title m-0">Notifications</Title>
        <Button type="link" className="mark-read-btn" onClick={markAllRead}>
          Mark all as read
        </Button>
      </div>

      <List
        dataSource={data}
        renderItem={(item) => (
          <div className={`notification-item ${!item.isRead ? 'unread' : ''} ${item.type}`}>
            <div className="d-flex align-items-start gap-3">
              {getIcon(item.type)}
              <div className="content-flex flex-grow-1">
                <div className="d-flex justify-content-between">
                  <Text strong className="notif-title">{item.title}</Text>
                  {!item.isRead && <div className="unread-dot" />}
                </div>
                <Text className="notif-desc d-block">{item.description}</Text>
                <Text type="secondary" className="notif-time">{item.timestamp}</Text>
              </div>
            </div>
          </div>
        )}
      />
    </Card>
  );
};

export default Notifications;
