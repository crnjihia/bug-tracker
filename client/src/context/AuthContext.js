import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
          // Verify token validity with backend
          await axios.get('/api/validate-token', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (username, password) => {
      try {
        setLoading(true);
        const response = await axios.post('/api/login', { username, password });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);

        enqueueSnackbar('Login successful', { variant: 'success' });
        return { success: true };
      } catch (error) {
        let message = 'Login failed';
        if (error.response) {
          message = error.response.data.message || message;
          if (error.response.status === 401) {
            message = 'Invalid credentials';
          }
        }

        enqueueSnackbar(message, { variant: 'error' });
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar]
  );

  const register = useCallback(
    async (username, password) => {
      try {
        setLoading(true);
        await axios.post('/api/register', { username, password });

        enqueueSnackbar('Registration successful! Please login', { variant: 'success' });
        return { success: true };
      } catch (error) {
        let message = 'Registration failed';
        if (error.response) {
          message = error.response.data.message || message;
          if (error.response.status === 409) {
            message = 'Username already exists';
          }
        }

        enqueueSnackbar(message, { variant: 'error' });
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
  }, [enqueueSnackbar]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem('token');
  }, [user]);

  // Get auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    getAuthHeaders,
    setUser, // Only expose if absolutely needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
