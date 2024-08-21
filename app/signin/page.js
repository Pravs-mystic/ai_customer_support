'use client';

import { useState } from 'react';
import { Box, Button, Container, Paper, Stack, Typography, TextField, Divider, Alert } from "@mui/material";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleIcon from '@mui/icons-material/Google';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.error || 'An error occurred during sign in');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url; // Redirect to Google's OAuth page
      } else {
        const data = await response.json();
        setError(data.error || 'An error occurred with Google sign in');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSignIn}>
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
            <Button type="submit" variant="contained">Sign In</Button>
          </Stack>
        </form>
        <Divider sx={{ my: 3 }}>OR</Divider>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          fullWidth
        >
          Continue with Google
        </Button>
        <Typography sx={{ mt: 2 }}>
          Don&apos;t have an account? <Link href="/signup"><Button>Create one</Button></Link>
        </Typography>
      </Paper>
    </Container>
  );
}