'use client'
import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Stack, Button, Container, Typography, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Paper, Avatar, Menu, MenuItem, TextField } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Image from 'next/image';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, storage, googleProvider } from './firebase';
import Chatinterface from "./components/chatinterface";
import { createUser, createConversation, saveMessage, getUserConversations, getConversationMessages } from '../utils/dbOperations';
import SignInPage from './signin/page';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers/AuthProvider';
import ChatInterface from './components/chatinterface';
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";
import ChatDrawer from "./components/chatdrawer";
import Header from "./components/header";
import KnowledgeBase from "./components/knowledgeBase";

export default function Home() {
  console.log('Home component rendering');
  
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, how can I help you today?" }
  ]);
  const [files, setFiles] = useState([]);
  const [menuPosition, setMenuPosition] = useState(null);
  // const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [isCreatingKB, setIsCreatingKB] = useState(false);
  const [newKBName, setNewKBName] = useState('');
  const chatContainerRef = useRef(null);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [activeComponent, setActiveComponent] = useState('chat');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading || !isClient) {
    return <div>Loading...</div>;
  }

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };
  // useEffect(() => {
  //   console.log("use effect messages ", messages)
  //   if (chatContainerRef.current) {
  //     chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  //   }
  // }, [messages]);

  // const checkUserSession = async () => {
  //   try {
  //     const response = await fetch('/api/auth/session', {
  //       method: 'GET',
  //       credentials: 'include' // Important for including cookies in the request
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.isLoggedIn) {
  //         setUser(data.user);
  //         const userConversations = await getUserConversations(data.user.id);
  //         setConversations(userConversations);
  //         if (userConversations.length > 0) {
  //           setCurrentConversationId(userConversations[0].id);
  //           loadConversationMessages(userConversations[0].id);
  //         }
  //         loadUserFiles(data.user.id);
  //       } else {
  //         setUser(null);
  //       }
  //     } else {
  //       setUser(null);
  //     }
  //   } catch (error) {
  //     console.error("Error checking user session:", error);
  //     setUser(null);
  //   }
  // };



  // const handleSignOut = async () => {
  //   try {
  //     const response = await fetch('/api/auth/signout', {
  //       method: 'POST',
  //       credentials: 'include' // Important for including cookies in the request
  //     });
  //     if (response.ok) {
  //       setUser(null);
  //       setMenuPosition(null);
  //       setFiles([]);
  //       setConversations([]);
  //       setCurrentConversationId(null);
  //       setMessages([]);
  //       router.push('/');
  //     }
  //   } catch (error) {
  //     console.error("Error signing out:", error);
  //   }
  // };



  const handleSignIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with email/password", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleCreateAccount = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await userCredential.user.updateProfile({ displayName });
      await createUser(userCredential.user.uid, email, displayName);
    } catch (error) {
      console.error("Error creating account", error);
    }
  };


  const loadConversationMessages = async (conversationId) => {
    const messages = await getConversationMessages(conversationId);
    setMessages(messages);
  };

  const createNewConversation = async () => {
    const newConversation = await getOrCreateConversation(user.uid);
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
  };

  const loadUserFiles = async (userId) => {
    try {
      const response = await fetch(`/api/knowledgebases?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge bases');
      }

      const data = await response.json();
      console.log("know ", data.knowledgeBases);
      setKnowledgeBases(data.knowledgeBases);

      // Create an array of knowledge bases, including empty ones
      const flattenedKBs = data.knowledgeBases.map(kb => ({
        name: kb.name,
        id: kb.id,
        isKnowledgeBase: true, // Flag to identify this as a knowledge base, not a file
        documentsCount: kb.Documents ? kb.Documents.length : 0
      }));

      // Flatten the structure for compatibility with existing FileList component
      const flattenedFiles = data.knowledgeBases.flatMap(kb => 
        (kb.Documents || []).map(doc => ({
          name: doc.fileName,
          knowledgeBaseName: kb.name,
          knowledgeBaseId: kb.id,
          documentId: doc.id,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          isKnowledgeBase: false // Flag to identify this as a file, not a knowledge base
        }))
      );

      console.log("flattenedKBs ", flattenedKBs);
      console.log("flattenedFiles ", flattenedFiles);

      // Combine knowledge bases and files
      const combinedItems = [...flattenedKBs, ...flattenedFiles];
      setFiles(combinedItems);
    } catch (error) {
      console.error('Error loading user files:', error);
      // Handle error (e.g., show error message to user)
    }
  };




  // const createIndexAndEmbeddings = useCallback(async () => {
  //   if (!user) {
  //     console.error("No user logged in");
  //     return;
  //   }

  //   try {
  //     const response = await fetch('/api/setup', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ userId: user.uid })
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to create index and embeddings');
  //     }

  //     const result = await response.json();
  //     console.log(result.data);

  //   } catch (error) {
  //     console.error("Error creating index and embeddings:", error);
  //   }
  // }, [user]);

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
          <Button color="inherit" onClick={() => router.push('/signin')}>Login</Button>
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

  // const ChatDrawer = () => {
  
  //   const handleCreateKB = async () => {
  //     if (!newKBName.trim()) return;
  
  //     try {
  //       const response = await fetch('/api/knowledgebases', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ name: newKBName, userId: user.id }),
  //       });
  
  //       if (!response.ok) {
  //         throw new Error('Failed to create knowledge base');
  //       }
  
  //       // Reset state and reload user files
  //       setNewKBName('');
  //       setIsCreatingKB(false);
  //       loadUserFiles(user.id);
  //     } catch (error) {
  //       console.error('Error creating knowledge base:', error);
  //       // Handle error (e.g., show error message to user)
  //     }
  //   };
  
  //   return (
  //     <Drawer
  //       variant="permanent"
  //       sx={{
  //         width: 240,
  //         flexShrink: 0,
  //         [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
  //       }}
  //     >
  //       <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
  //         <Image src="/logo.jpg" alt="Rag Chat Logo" width={40} height={40} />
  //         <Typography variant="h6" sx={{ ml: 2 }}>Rag Chat</Typography>
  //       </Box>
  //       <Box sx={{ overflow: 'auto' }}>
  //         <List>
  //           <ListItem button onClick={createNewConversation}>
  //             <ListItemIcon>
  //               <NoteAddIcon />
  //             </ListItemIcon>
  //             <ListItemText primary="New Conversation" />
  //           </ListItem>
  //           <ListItem>
  //             <ListItemIcon>
  //               <StorageIcon />
  //             </ListItemIcon>
  //             <ListItemText primary="Create Knowledge Base" />
  //             <IconButton onClick={() => setIsCreatingKB(true)}>
  //               <NoteAddIcon />
  //             </IconButton>
  //           </ListItem>
  //         </List>
  //         {isCreatingKB && (
  //           <Box sx={{ p: 2 }}>
  //             <TextField
  //               fullWidth
  //               size="small"
  //               label="Knowledge Base Name"
  //               value={newKBName}
  //               onChange={(e) => setNewKBName(e.target.value)}
  //               sx={{ mb: 1 }}
  //             />
  //             <Button variant="contained" onClick={handleCreateKB} fullWidth>
  //               Create
  //             </Button>
  //           </Box>
  //         )}
  //         <FileList files={files} />
  //         <List>
  //           {conversations.map((conversation) => (
  //             <ListItem 
  //               button 
  //               key={conversation.id} 
  //               onClick={() => {
  //                 setCurrentConversationId(conversation.id);
  //                 loadConversationMessages(conversation.id);
  //               }}
  //               selected={conversation.id === currentConversationId}
  //             >
  //               <ListItemText primary={`Conversation ${conversation.id.slice(0, 8)}...`} />
  //             </ListItem>
  //           ))}
  //         </List>
  //       </Box>
  //     </Drawer>
  //   );
  // };


  const CreateAccountPage = () => (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" gutterBottom>Create Account</Typography>
        {/* Add create account form here */}
      </Paper>
    </Container>
  );
 

  return (
    <div className="flex h-screen">
        <WelcomePage />
    </div>
  );
}