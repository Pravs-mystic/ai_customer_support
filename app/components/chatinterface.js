import React, { useState, useRef, useEffect } from 'react';
import { Box, Stack, TextField, Button, Typography, Paper } from "@mui/material";

const ChatInterface = ({ messages, sendMessage: parentSendMessage }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      parentSendMessage(message);
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

  return (
    <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Stack direction="column" spacing={2} sx={{ flexGrow: 1, overflow: 'auto' }}>
        {messages.map((msg, index) => (
          <Box key={index} display="flex" justifyContent={msg.role === "assistant" ? 'flex-start' : 'flex-end'}>
            <Paper elevation={1} sx={{
              p: 2,
              maxWidth: '75%',
              backgroundColor: msg.role === "user" ? '#e3f2fd' : '#f1f8e9',
            }}>
              <Typography>{msg.content}</Typography>
            </Paper>
          </Box>
        ))}
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          sx={{ bgcolor: 'black', '&:hover': { bgcolor: '#333' } }}
        >
          Send
        </Button>
      </Stack>
    </Box>
  );
};

export default React.memo(ChatInterface);