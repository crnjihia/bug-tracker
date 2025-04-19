import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BugDetailPage from './pages/BugDetailPage';
import Navbar from './components/Navbar';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';

// Custom theme with responsive typography and more color options
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#19857b',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <Router>
          <AuthProvider>
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />

              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path='/' element={<DashboardPage />} />
                <Route path='/bugs/:id' element={<BugDetailPage />} />
              </Route>

              {/* Fallback route */}
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
