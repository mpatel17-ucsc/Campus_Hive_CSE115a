import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

import { signOut } from "firebase/auth";
import { auth } from "../util/firebase";
import { useNavigate } from "react-router-dom";

const TopBar = ({
  searchTerm,
  setSearchTerm,
  tags,
  selectedTags,
  setSelectedTags,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth);
    navigate("/login");
  };

  const handleTagChange = (event) => {
    setSelectedTags(event.target.value);
  };

  const handleTagDelete = (tagToDelete) => {
    setSelectedTags((prevTags) =>
      prevTags.filter((tag) => tag !== tagToDelete),
    );
  };

  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: 72,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Campus Hive
        </Typography>

        {/* Search Bar */}
        <TextField
          variant="outlined"
          placeholder="Search activities..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: "30%" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Tag Filter Dropdown */}
        <FormControl sx={{ minWidth: 200, height: 40 }}>
          <InputLabel sx={{ fontSize: "0.85rem", top: -6 }}>
            Filter by Tags
          </InputLabel>
          <Select
            multiple
            value={selectedTags}
            onChange={handleTagChange}
            sx={{ height: 40, display: "flex", alignItems: "center" }}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selected.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onMouseDown={(event) => event.stopPropagation()}
                    onDelete={() => handleTagDelete(tag)}
                    color="primary"
                    variant="outlined"
                    sx={{
                      height: 24,
                      fontSize: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid #1976d2",
                      marginBottom: "5px",
                    }}
                  />
                ))}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            {tags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={() => navigate("/create-activity")}
            title="Create Post"
          >
            <AddIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate("/home")}
            title="Home"
          >
            <HomeIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: "#1976d2" }}>
            {auth.currentUser?.email?.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
