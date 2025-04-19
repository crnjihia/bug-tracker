import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useSnackbar } from 'notistack';

export default function AddBugDialog({ open, onClose, onSubmit }) {
  const { user, getAuthHeaders } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        '/api/bugs',
        { ...formData, created_by: user.id },
        { headers: getAuthHeaders() }
      );
      enqueueSnackbar('Bug created successfully', { variant: 'success' });
      onSubmit(response.data);
      handleClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create bug';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Report New Bug</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {error && <Alert severity='error'>{error}</Alert>}

            <TextField
              autoFocus
              required
              fullWidth
              label='Title'
              name='title'
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />

            <TextField
              multiline
              rows={4}
              fullWidth
              label='Description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name='priority'
                value={formData.priority}
                label='Priority'
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value='Low'>Low</MenuItem>
                <MenuItem value='Medium'>Medium</MenuItem>
                <MenuItem value='High'>High</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={loading || !formData.title.trim()}>
            {loading ? 'Submitting...' : 'Submit Bug'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
