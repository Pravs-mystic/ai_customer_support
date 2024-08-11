'use client'
import { useState, useEffect, useRef } from "react";
import { Box, Stack, Button, Container, Grid, TextField, Typography, AppBar, Toolbar, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useSession, signIn, signOut } from "next-auth/react";


export default function Home() {
  const [messages, setMessages] = useState([
  {  
    role: "assistant",
    content: "Hi, I'm the Headstarter support agent, how can i help you today?",
  }
  ]);

  const [message, setMessage] = useState('');
  const chatContainerRef = useRef(null);
  const { data: session } = useSession();

  useEffect(() => {
    console.log("messages ", messages);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
        <Toolbar sx={{bgcolor:'black'}}>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rag Chat
          </Typography>
          {session ? (
            <Button color="inherit" onClick={() => signOut()}>Logout</Button>
          ) : (
            <Button color="inherit" onClick={() => signIn('google')}>Login with Google</Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 4 }}>
            Empowering Conversations with AI
          </Typography>
          <Typography variant="h6" sx={{ mb: 8 }}>
            Your personalized AI-powered support agent, here to assist you.
          </Typography>
          {/* <Button variant="contained" color="primary" size="large" sx={{ px: 6, py: 2, mb: 8 }}>
            Get Started
          </Button> */}
        </Box>

        <Stack direction="column" spacing={2} sx={{ maxHeight: '60vh', overflow: 'auto', mb: 8 }} ref={chatContainerRef}>
          {messages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={message.role === "assistant" ? 'flex-start' : 'flex-end'}>
              {message.role === "user" ? (
                <Box sx={{
                  bgcolor: '#F1F4F7',
                  color: 'text.primary',
                  borderRadius: 16,
                  p: 2,
                  maxWidth: '75%',
                }}>
                  {message.content}
                </Box>
              ) : (
                <Box sx={{
                  color: 'text.primary',
                  borderRadius: 16,
                  p: 2,
                  width: '100%',
                }}>
                <Typography variant="body1" sx={{ width: '100%', p: 2 }}>
                  {message.content}
                </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <TextField
            label="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{ bgcolor: 'primary.dark' }}
          >
            Send
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={createIndexAndEmbeddings}
            sx={{ bgcolor: 'primary.dark' }}
          >
            Create Index and Embeddings
          </Button>
        </Stack>
      </Container>

      <Box component="footer" sx={{ py: 4, mt: 'auto', bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ©2024 Rag Chat. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}
