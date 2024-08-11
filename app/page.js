'use client'
import { useState, useEffect, useRef } from "react";
import { Box, Stack, Button, Container, TextField, Typography, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Paper, Avatar, Menu, MenuItem } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import { useSession, signIn, signOut } from "next-auth/react";
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, how can I help you today?" }
  ]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [menuPosition, setMenuPosition] = useState(null);
    const chatContainerRef = useRef(null);
  const { data: session } = useSession();


  const handleProfileClick = (event) => {
    setMenuPosition({
      top: event.clientY,
      left: event.clientX,
    });
  };
  
  const handleClose = () => {
    setMenuPosition(null);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (session?.user?.email) {
      const storedFiles = sessionStorage.getItem(`uploadedFiles_${session.user.email}`);
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      }
    }
  }, [session]);

  const handleFileUpload = (newFiles) => {
    const fileInfo = newFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    }));
    
    const updatedFiles = [...files, ...fileInfo];
    setFiles(updatedFiles);
    if (session?.user?.email) {
      sessionStorage.setItem(`uploadedFiles_${session.user.email}`, JSON.stringify(updatedFiles));
    }
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (session?.user?.email) {
      sessionStorage.setItem(`uploadedFiles_${session.user.email}`, JSON.stringify(updatedFiles));
    }
  };

  const createIndexAndEmbeddings = async () => {
    try {
      const result = await fetch('/api/setup',{
        method: 'POST'
      })

      console.log("result ", result)
      // const data = await result.json()
      // console.log("data ", data)
    } catch (error) {
      console.error("Error creating index and embeddings:", error)
    }


  }
  const sendMessage = async () => {
    console.log("message ", message);
    setMessage('');
    setMessages((messages)=> [...messages, {role: "user", content: message},{role: "assistant", content: ""}]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {  'Content-Type': 'application/json' },
      body: JSON.stringify([
        ...messages,
        {
          role: "user",
          content: message
        }
      ])
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      return reader.read().then(async function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array, { stream: true });
        setMessages((messages)=>{
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [...otherMessages, {...lastMessage, content: lastMessage.content + text}];
        })
        return reader.read().then(processText);
      })
    })


  }

  const WelcomePage = () => (
    <>
      <AppBar position="fixed" sx={{ bgcolor: 'black' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rag Chat
          </Typography>
          <Button color="inherit" onClick={() => signIn('google')}>Login</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h2" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            Welcome to Rag Chat
          </Typography>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4, color: '#3f51b5' }}>
            Your AI-powered support assistant
          </Typography>
          <Typography variant="body1" paragraph>
            Rag Chat uses advanced AI to provide instant, accurate responses to your queries. 
            Experience the power of AI-driven support with these features:
          </Typography>
          <Stack spacing={2} sx={{ mt: 4 }}>
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <CloudUploadIcon sx={{ mr: 2, color: '#4caf50' }} />
              <Typography variant="body1">Upload your own knowledge base for personalized assistance</Typography>
            </Paper>
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <SearchIcon sx={{ mr: 2, color: '#2196f3' }} />
              <Typography variant="body1">Query your knowledge base with natural language</Typography>
            </Paper>
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <StorageIcon sx={{ mr: 2, color: '#ff9800' }} />
              <Typography variant="body1">Coming soon: Access multiple knowledge bases and enhanced context understanding</Typography>
            </Paper>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => signIn('google')}
              sx={{ 
                mt: 4, 
                backgroundColor: '#4caf50', 
                '&:hover': { backgroundColor: '#45a049' } 
              }}
            >
              Sign in with Google to Get Started
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );

  const ChatInterface = () => (
    <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.jpg" alt="Rag Chat Logo" width={40} height={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>Rag Chat</Typography>
        </Box>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button onClick={() => document.getElementById('fileInput').click()}>
              <ListItemIcon>
                <UploadFileIcon />
              </ListItemIcon>
              <ListItemText primary="Upload File" />
            </ListItem>
          </List>
          <FileUpload onFileUpload={handleFileUpload} />
          <FileList files={files} onRemoveFile={handleRemoveFile} />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, position: 'relative' }}>
        <IconButton onClick={handleProfileClick}>
          <Avatar src={session?.user?.image} alt={session?.user?.name} />
        </IconButton>
        <Menu
          anchorReference="anchorPosition"
          anchorPosition={menuPosition}
          open={Boolean(menuPosition)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => { signOut(); handleClose(); }}>Logout</MenuItem>
        </Menu>
      </Box>
      <Stack direction="column" spacing={2} sx={{ flexGrow: 1, overflow: 'auto' }} ref={chatContainerRef}>
        {messages.map((message, index) => (
          <Box key={index} display="flex" justifyContent={message.role === "assistant" ? 'flex-start' : 'flex-end'}>
            <Paper elevation={1} sx={{
              p: 2,
              maxWidth: '75%',
              backgroundColor: message.role === "user" ? '#e3f2fd' : '#f1f8e9',
            }}>
              <Typography>{message.content}</Typography>
            </Paper>
          </Box>
        ))}
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{ bgcolor: 'black', '&:hover': { bgcolor: '#333' } }}
        >
          Send
        </Button>
        <Button
            variant="outlined"
            color="primary"
            onClick={createIndexAndEmbeddings}
          >
            Create Index and Embeddings
        </Button>
      </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    {!session ? <WelcomePage /> : <ChatInterface />}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto', 
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 Rag Chat. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}