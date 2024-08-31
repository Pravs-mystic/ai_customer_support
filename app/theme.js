'use client'
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3100a2', // Dark Blue
      contrastText: '#FFFFFF', // White text on primary
    },
    secondary: {
      main: '#87ceeb', // Lighest Purple
      contrastText: '#000000', // Black text on secondary
    },
    background: {
      default: '#F5F5F5', // Light Background
      paper: '#F5F5F5', // Darker Background for paper elements -EAEAEA
      dark: '#431c76' //  Purple
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevents all-caps text in buttons
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#4A90E2', // Light Blue border
            },
            '&:hover fieldset': {
              borderColor: '#003DA5', // Dark Blue on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#431c76', // Purple when focused
            },
          },
        },
      },
    },
  },
});

export default theme;