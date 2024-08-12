'use client'
import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Stack, Button, Container, TextField, Typography, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Paper, Avatar, Menu, MenuItem } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import Image from 'next/image';
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, storage, googleProvider } from './firebase';
import Chatinterface from "./components/chatinterface";

export default function Home() {
  console.log('Home component rendering');
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, how can I help you today?" }
  ]);
  const [files, setFiles] = useState([]);
  const [menuPosition, setMenuPosition] = useState(null);
  const [user, setUser] = useState(null);
  const chatContainerRef = useRef(null);

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
    console.log("use effect messages ", messages)
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        console.log("User is authenticated:", user.uid);
        loadUserFiles(user.uid);
      } else {
        console.log("User is not authenticated");
        setFiles([]);
      }
    });
    return () => unsubscribe();
  }, []);


  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setMenuPosition(null); // Close the menu
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const loadUserFiles = async (userId) => {
    const filesRef = ref(storage, `files/${userId}`);
    const fileList = await listAll(filesRef);
    const filesData = await Promise.all(
      fileList.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return { name: item.name, url };
      })
    );
    setFiles(filesData);
  };

  const handleFileUpload = async (newFiles) => {
    if (!user) return;
  
    const uploadPromises = newFiles.map(async (file) => {
      const fileRef = ref(storage, `files/${user.uid}/${file.name}`);
      try {
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        console.log('File uploaded successfully');
        return { name: file.name, url };
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    });
  
    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
      await createIndexAndEmbeddings(); // Automatically create index after upload
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleRemoveFile = async (index) => {
    if (!user) return;

    const fileToRemove = files[index];
    const fileRef = ref(storage, `files/${user.uid}/${fileToRemove.name}`);

    try {
      await deleteObject(fileRef);
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
      await createIndexAndEmbeddings(); // Automatically create index after removal
    } catch (error) {
      console.error("Error removing file:", error);
    }
  };

  const createIndexAndEmbeddings = useCallback(async () => {
    if (!user) {
      console.error("No user logged in");
      return;
    }

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.uid })
      });

      if (!response.ok) {
        throw new Error('Failed to create index and embeddings');
      }

      const result = await response.json();
      console.log(result.data);

    } catch (error) {
      console.error("Error creating index and embeddings:", error);
    }
  }, [user]);

  const sendMessage = async (message) => {
    console.log("message ", message);
    setMessages((messages)=> [...messages, {role: "user", content: message},{role: "assistant", content: ""}]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {  'Content-Type': 'application/json' },
      body: JSON.stringify({
      messages: [
        ...messages,
        {
          role: "user",
          content: message
        }
      ],
      userId: user.uid // Add the user ID here
    })
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
          <Button color="inherit" onClick={handleSignIn}>Login</Button>
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
        </Paper>
      </Container>
    </>
  );

  const ChatDrawer = () => (
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
  );

 

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {user ? (
        <>
          <ChatDrawer />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <IconButton onClick={(e) => setMenuPosition({ top: e.clientY, left: e.clientX })}>
                <Avatar src={user.photoURL} alt={user.displayName} />
              </IconButton>
              <Menu
                anchorReference="anchorPosition"
                anchorPosition={menuPosition}
                open={Boolean(menuPosition)}
                onClose={() => setMenuPosition(null)}
              >
                <MenuItem onClick={handleSignOut}>Logout</MenuItem>
              </Menu>
            </Box>
            <Chatinterface messages={messages} sendMessage={sendMessage} />
          </Box>
        </>
      ) : (
        <WelcomePage />
      )}
    </Box>
  );
}