import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  Refresh,
  Edit,
  Delete,
  MoreVert,
} from "@mui/icons-material";
import AddBugDialog from "../components/AddBugDialog";
import BugStatusMenu from "../components/BugStatusMenu";
import { useSnackbar } from "notistack";

export default function DashboardPage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [bugs, setBugs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const fetchBugs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (priorityFilter !== "All") params.priority = priorityFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get("/api/bugs", {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBugs(response.data);
    } catch (error) {
      enqueueSnackbar("Error fetching bugs", { variant: "error" });
      console.error("Error fetching bugs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, [statusFilter, priorityFilter]);

  const handleAddBug = async (bugData) => {
    try {
      const response = await axios.post("/api/bugs", bugData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBugs([response.data, ...bugs]);
      setOpenDialog(false);
      enqueueSnackbar("Bug created successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Error creating bug", { variant: "error" });
      console.error("Error adding bug:", error);
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      await axios.patch(
        `/api/bugs/${bugId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBugs(
        bugs.map((bug) =>
          bug.id === bugId ? { ...bug, status: newStatus } : bug
        )
      );
      enqueueSnackbar("Status updated successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Error updating status", { variant: "error" });
      console.error("Error updating bug status:", error);
    }
  };

  const handleDeleteBug = async (bugId) => {
    try {
      await axios.delete(`/api/bugs/${bugId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBugs(bugs.filter((bug) => bug.id !== bugId));
      enqueueSnackbar("Bug deleted successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Error deleting bug", { variant: "error" });
      console.error("Error deleting bug:", error);
    }
  };

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || bug.status === statusFilter;
    const matchesPriority =
      priorityFilter === "All" || bug.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Bug Tracker
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Bug
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          label="Search Bugs"
          variant="outlined"
          fullWidth
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Box sx={{ display: "flex", gap: 2, minWidth: { sm: 400 } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              label="Priority"
            >
              <MenuItem value="All">All Priorities</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchBugs} sx={{ alignSelf: "center" }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBugs.length > 0 ? (
                filteredBugs.map((bug) => (
                  <TableRow key={bug.id} hover>
                    <TableCell>{bug.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={bug.status}
                        color={
                          bug.status === "Open"
                            ? "error"
                            : bug.status === "In Progress"
                            ? "warning"
                            : "success"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bug.priority}
                        color={
                          bug.priority === "High"
                            ? "error"
                            : bug.priority === "Medium"
                            ? "warning"
                            : "success"
                        }
                      />
                    </TableCell>
                    <TableCell>{bug.created_by_username}</TableCell>
                    <TableCell>
                      {bug.assigned_to_username || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <BugStatusMenu
                        bug={bug}
                        onStatusChange={handleStatusChange}
                      />
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this bug?"
                              )
                            ) {
                              handleDeleteBug(bug.id);
                            }
                          }}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No bugs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AddBugDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleAddBug}
      />
    </Container>
  );
}
