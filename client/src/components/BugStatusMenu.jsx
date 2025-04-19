import { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import { MoreVert } from "@mui/icons-material";

export default function BugStatusMenu({ bug, onStatusChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(bug.id, newStatus);
    handleClose();
  };

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls="status-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="status-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleStatusChange("Open")}>
          Mark as Open
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange("In Progress")}>
          Mark as In Progress
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange("Resolved")}>
          Mark as Resolved
        </MenuItem>
      </Menu>
    </>
  );
}
