import { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CreateIcon from '@mui/icons-material/Create';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Image from 'next/image';

export default function ChatDrawer({ onComponentChange }) {
  const [isOpen, setIsOpen] = useState(true);

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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
          <IconButton onClick={toggleDrawer} style={{ color: 'white' }}>
            <MenuOpenIcon />
          </IconButton>
          {isOpen && (
            <IconButton style={{ color: 'white' }}>
              <NoteAddIcon />
            </IconButton>
          )}
        </div>
        <List>
        {isOpen && (
          <ListItem>
            <ListItemIcon>
              <Image src="/logo.jpg" alt="Logo" width={30} height={30} />
            </ListItemIcon>
            <ListItemText primary="Doc Chat" />
          </ListItem>
        )}
          <ListItem button onClick={() => onComponentChange('chat')}>
            <ListItemIcon>
              <ChatBubbleOutlineIcon style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Chat" />
          </ListItem>
          <ListItem button onClick={() => onComponentChange('knowledgeBase')}>
            <ListItemIcon>
              <CreateIcon style={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Create Knowledge Base" />
          </ListItem>
          {/* Add your conversation list items here */}
        </List>
      </div>
    </Drawer>
  );
}