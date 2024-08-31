import { useEffect, useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Typography, Paper, Tooltip } from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CreateIcon from '@mui/icons-material/Create';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Image from 'next/image';
import { useAuth } from '../providers/AuthProvider';

export default function ChatDrawer({ onComponentChange, onConversationChange}) {
  const [isOpen, setIsOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserConversations();
    }
  }, [user]);

  const loadUserConversations = async () => {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getUserConversations', userId: user.id }),
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getConversationMessages', conversationId }),
      });
      const messages = await response.json();
      console.log("get messages when clicked on conversation:", messages)
      onConversationChange(conversationId, messages);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const createNewConversation = async () => {
      onConversationChange(null, []);
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Drawer
      variant="permanent"
      open={isOpen}
      sx={{
        width: isOpen ? 260 : 60,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isOpen ? 260 : 60,
          boxSizing: 'border-box',
          transition: 'width 0.2s',
          overflowX: 'hidden',
          backgroundColor: (theme) => theme.palette.background.dark,
          color: 'white',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex',justifyContent:'space-between', alignItems: 'left' }}>
          <IconButton onClick={toggleDrawer} style={{ color: 'white' }}>
            <MenuOpenIcon />
          </IconButton>
          {isOpen && (
            <Tooltip title="New Conversation" arrow>
              <IconButton style={{ color: 'white' }} onClick={createNewConversation}>
                <NoteAddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <List sx={{ padding: 0 }}>
          {isOpen && (
             <ListItem sx={{ p: '8px' }}>
             <ListItemIcon>
               <Image src="/BlueStraw.png" alt="Logo" width={50} height={50} />
             </ListItemIcon>
           
               <Typography variant="h6" sx={{ color: 'white', fontWeight:"bold" }}>
                 <span style={{ color: 'skyblue' }}>Blue</span>Straw
               </Typography>
          
           </ListItem>
          )}
          <ListItem button onClick={() => onComponentChange('knowledgeBase')} sx={{ p: '8px' }}>
            <ListItemIcon>
              <CreateIcon style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Create Knowledge Base" />
          </ListItem>
          {conversations.map((conversation) => (
            <ListItem button key={conversation.id} onClick={() => loadConversationMessages(conversation.id)} sx={{ p: '8px' }}>
              <ListItemIcon >
                <ChatBubbleOutlineIcon style={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary={conversation.name || 'Unnamed Conversation'} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}