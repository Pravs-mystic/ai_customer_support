'use client';

import { useState } from 'react';
import { Box, Button, Container, Paper, Stack, Typography, TextField } from "@mui/material";
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (response.ok) {
        // Signup successful
        router.push('/signin'); // Redirect to sign in page
      } else {
        const data = await response.json();
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" gutterBottom>Sign Up</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSignUp}>
          <Stack spacing={2}>
            <TextField 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <TextField 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <TextField 
              label="Display Name" 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              required 
            />
            <Button type="submit" variant="contained">Sign Up</Button>
            <Typography>Already have an account? <Button onClick={() => router.push('/signin')}>Sign In</Button></Typography>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}