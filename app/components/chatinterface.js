import React, { useState, useRef, useEffect } from 'react';
import { Box, Stack, TextField, Button, Typography, Paper, useTheme, useMediaQuery } from "@mui/material";
import { useAuth } from '../providers/AuthProvider';
import ReactMarkdown from 'react-markdown';

const ChatInterface = ({ conversationId, initialMessages }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, how can I help you today?" }
  ]);
  const inputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef(null);
  const { user } = useAuth()

  useEffect(() => {
    console.log("Calling use effect")
    setMessages(initialMessages || []);
    console.log("Messages set in useeffect:", messages)
  }, [initialMessages]);

  const sendMessage = async (message) => {
    console.log("message ", message);
    setMessages((messages) => [...messages, { role: "user", content: message }, { role: "assistant", content: "" }]);

    let convId = conversationId;
    console.log("convId", convId)

    if (!convId) {
      // Create a new conversation if it doesn't exist
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createConversation', userId: user.id }),
      });
      const newConversation = await response.json();
      convId = newConversation.id;
      console.log("created Conversation:",convId)
    }

    // Save the user message to the database
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'saveMessage',
        conversationId: convId,
        role: 'user',
        content: message,
      }),
    });

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...messages,
          {
            role: "user",
            content: message
          }
        ],
        userId:user.id,
        conversationId:convId
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
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [...otherMessages, { ...lastMessage, content: lastMessage.content + text }];
        });

        // Save the assistant message to the database
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'saveMessage',
            conversationId: convId,
            role: 'assistant',
            content: text,
          }),
        });

        return reader.read().then(processText);
      });
    });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <Stack
        direction="column"
        spacing={2}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '0.4em'
          },
          '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
            outline: '1px solid slategrey'
          }
        }}
      >
        {messages.map((msg, index) => (
          <Box key={index} display="flex" justifyContent={msg.role === "assistant" ? 'flex-start' : 'flex-end'}>
            {msg.role === "user" ? (
              <Paper elevation={1} sx={{
                p: 2,
                maxWidth: isMobile ? '90%' : '75%',
                backgroundColor: theme.palette.secondary.main,
                boxShadow: '3px 3px 6px 0px inset rgb(135 206 235)',
                wordBreak: 'break-word'
              }}>
                <Typography>{msg.content}</Typography>
              </Paper>
            ) : (
              <Box sx={{
                p: 2,
                maxWidth: isMobile ? '90%' : '75%',
                backgroundColor: theme.palette.background.default,
                wordBreak: 'break-word',
                borderRadius: '4px'
              }}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </Box>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Stack>
      <Box sx={{ p: 2 }}>
        <Stack direction={isMobile ? "column" : "row"} spacing={2}>
          <TextField
            label="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            fullWidth
            multiline
            maxRows={4}
            inputRef={inputRef}
            sx={{color:'text.primary'}}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            sx={{
              minWidth: isMobile ? '100%' : 'auto'
            }}
          >
            Send
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default React.memo(ChatInterface);