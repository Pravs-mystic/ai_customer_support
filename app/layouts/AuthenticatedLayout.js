'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import ChatDrawer from '../components/chatdrawer';
import Header from '../components/header';
import ChatInterface from '../components/chatinterface';
import KnowledgeBase from '../components/knowledgeBase';
import { Box } from '@mui/material';
import Chatinterface from '../components/chatinterface';

export default function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState('chat');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };


  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
          <ChatDrawer onComponentChange={handleComponentChange} />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Header />
            {activeComponent === 'chat' && <ChatInterface className="app-container"/>}
            {activeComponent === 'knowledgeBase' && <KnowledgeBase className="app-container"/>}
          </Box>
    </Box>
  );
}