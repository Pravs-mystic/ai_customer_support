'use client'
import Link from 'next/link';
import { Button, Typography } from '@mui/material';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Typography variant="h4" gutterBottom>
        Welcome to AI Customer Support
      </Typography>
      <Typography variant="body1" gutterBottom>
        Please sign in to continue
      </Typography>
      <Link href="/signin">
        <Button variant="contained" color="primary">
          Sign In
        </Button>
      </Link>
    </div>
  );
}