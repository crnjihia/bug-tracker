import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, Edit, Delete, Check, Close, Comment as CommentIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

export default function BugDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
  });

  useEffect(() => {
    const fetchBugDetails = async () => {
      try {
        setLoading(true);
        const [bugRes, commentsRes] = await Promise.all([
          axios.get(`/api/bugs/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`/api/bugs/${id}/comments`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setBug(bugRes.data);
        setComments(commentsRes.data);
        setEditData({
          title: bugRes.data.title,
          description: bugRes.data.description,
          status: bugRes.data.status,
          priority: bugRes.data.priority,
        });
      } catch (err) {
        setError('Failed to load bug details');
        enqueueSnackbar('Error loading bug', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchBugDetails();
  }, [id, enqueueSnackbar]);

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(
        `/api/bugs/${id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setBug((prev) => ({ ...prev, status: newStatus }));
      enqueueSnackbar('Status updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Error updating status', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      try {
        await axios.delete(`/api/bugs/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        enqueueSnackbar('Bug deleted', { variant: 'success' });
        navigate('/');
      } catch (err) {
        enqueueSnackbar('Error deleting bug', { variant: 'error' });
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `/api/bugs/${id}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setComments([res.data, ...comments]);
      setNewComment('');
      enqueueSnackbar('Comment added', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Error adding comment', { variant: 'error' });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.patch(`/api/bugs/${id}`, editData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBug(res.data);
      setIsEditing(false);
      enqueueSnackbar('Bug updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Error updating bug', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth='md'>
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!bug) {
    return null;
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant='h4' component='h1'>
          Bug Details
        </Typography>

        {user?.id === bug.created_by && (
          <Box sx={{ ml: 'auto' }}>
            {isEditing ? (
              <>
                <IconButton onClick={handleSaveEdit} color='primary'>
                  <Check />
                </IconButton>
                <IconButton onClick={() => setIsEditing(false)} color='error'>
                  <Close />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton onClick={() => setIsEditing(true)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={handleDelete} color='error'>
                  <Delete />
                </IconButton>
              </>
            )}
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        {isEditing ? (
          <>
            <TextField
              fullWidth
              margin='normal'
              label='Title'
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
            <TextField
              fullWidth
              margin='normal'
              label='Description'
              multiline
              rows={4}
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            />
          </>
        ) : (
          <>
            <Typography variant='h5' gutterBottom>
              {bug.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip
                label={bug.status}
                color={
                  bug.status === 'Open'
                    ? 'error'
                    : bug.status === 'In Progress'
                      ? 'warning'
                      : 'success'
                }
                onClick={() =>
                  handleStatusChange(
                    bug.status === 'Open'
                      ? 'In Progress'
                      : bug.status === 'In Progress'
                        ? 'Resolved'
                        : 'Open'
                  )
                }
              />
              <Chip
                label={bug.priority}
                color={
                  bug.priority === 'High'
                    ? 'error'
                    : bug.priority === 'Medium'
                      ? 'warning'
                      : 'success'
                }
              />
            </Box>
            <Typography variant='body1' paragraph>
              {bug.description}
            </Typography>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant='subtitle2' color='text.secondary'>
          Created by: {bug.created_by_username} • {new Date(bug.created_at).toLocaleString()}
        </Typography>
        {bug.assigned_to_username && (
          <Typography variant='subtitle2' color='text.secondary'>
            Assigned to: {bug.assigned_to_username}
          </Typography>
        )}
      </Paper>

      <Typography variant='h6' gutterBottom>
        Comments
      </Typography>

      <Paper component='form' onSubmit={handleCommentSubmit} sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant='outlined'
          placeholder='Add a comment...'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          InputProps={{
            endAdornment: (
              <Button
                type='submit'
                variant='contained'
                endIcon={<CommentIcon />}
                disabled={!newComment.trim()}
              >
                Post
              </Button>
            ),
          }}
        />
      </Paper>

      <List>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Paper key={comment.id} sx={{ mb: 2, p: 2 }}>
              <ListItem disablePadding>
                <ListItemText
                  primary={comment.username}
                  secondary={new Date(comment.created_at).toLocaleString()}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItem>
              <Typography variant='body1' sx={{ mt: 1, ml: 2 }}>
                {comment.content}
              </Typography>
            </Paper>
          ))
        ) : (
          <Typography variant='body1' color='text.secondary' align='center'>
            No comments yet
          </Typography>
        )}
      </List>
    </Container>
  );
}
