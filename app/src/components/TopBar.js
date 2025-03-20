import {
  AppBar,
  Toolbar,
  Drawer,
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  LocalActivity as LocalActivityIcon,
} from "@mui/icons-material";

import { signOut } from "firebase/auth";
import { auth } from "../util/firebase";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

const TopBar = ({
  searchTerm = "",
  setSearchTerm = () => {}, // Function to update search input
  tags = [], // List of available tags for filtering
  selectedTags = [], // Currently selected tags
  setSelectedTags = () => {}, // Function to update selected tags
  sortBy, // Sorting method (e.g., highest rated, most popular)
  setSortBy, // Function to update sorting preference
  showSearch = true, // Boolean flag to show/hide the search bar
  activities = [], // List of activities
}) => {
  const navigate = useNavigate(); // Hook to programmatically navigate between pages
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to manage sidebar open/close
  const [user, setUser] = useState(auth.currentUser); // State to store the currently logged-in user

  // Function to handle user logout
  const handleLogout = () => {
    signOut(auth); // Firebase function to sign out the user
    navigate("/login"); // Redirect to the login page after logout
  };

  // Function to handle sorting selection
  const handleSortChange = (event) => {
    setSortBy(event.target.value); // Update sorting state
  };

  // Function to handle tag selection
  const handleTagChange = (event) => {
    setSelectedTags(event.target.value); // Update selected tags state
  };

  // Function to remove a selected tag from the filter
  const handleTagDelete = (tagToDelete) => {
    setSelectedTags((prevTags) =>
      prevTags.filter((tag) => tag !== tagToDelete), // Remove tag from list
    );
  };

  // Function to toggle sidebar state (open/close)
  const toggleSidebar = (open) => () => {
    setSidebarOpen(open);
  };

  // Effect to listen for authentication state changes (e.g., login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state when authentication changes
    });

    return unsubscribe; // Cleanup function to unsubscribe from listener
  }, []); // Runs only once when the component mounts

  return (
    <>
      {/* Navigation Bar at the top */}
      <AppBar position="fixed" color="default" elevation={1}
        sx={{
          paddingTop: "10px",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 72,
          }}
        >
          {/* App Title */}
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Campus Hive
          </Typography>

          {/* Search and Filtering Controls */}
          {showSearch && (
            <>
              {/* Search Bar for finding activities */}
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

              {/* Dropdown to Filter Activities by Tags */}
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

              {/* Dropdown to Sort Activities */}
              <FormControl sx={{ minWidth: 200, height: 40 }}>
                <InputLabel sx={{ fontSize: "0.85rem", top: -6 }}>
                  Sort By
                </InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  sx={{ height: 40, display: "flex", alignItems: "center" }}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="highestRated">Highest Rated</MenuItem>
                  <MenuItem value="mostPopular">Most Popular</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {/* Icons for Navigation and User Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            
            {/* Create Activity Button */}
            <IconButton
              color="inherit"
              onClick={() => navigate("/create-activity")}
              title="Create Post"
            >
              <AddIcon />
            </IconButton>

            {/* Home Button */}
            <IconButton
              color="inherit"
              onClick={() => navigate("/home")}
              title="Home"
            >
              <HomeIcon />
            </IconButton>

            {/* Logout Button */}
            <IconButton color="inherit" onClick={handleLogout} title="Logout">
              <LogoutIcon />
            </IconButton>

            {/* User Avatar: Click to open the Sidebar */}
            <Avatar
              src={user?.photoURL || null}
              sx={{ bgcolor: "#1976d2", cursor: "pointer" }}
              onClick={toggleSidebar(true)}
            >
              {/* Fallback: if there is no photoURL, display first letter of the user's email */}
              {!user?.photoURL &&
                auth.currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>

          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar Drawer for Additional Navigation Options */}
      <Drawer anchor="right" open={sidebarOpen} onClose={toggleSidebar(false)}>
        <List sx={{ width: 250 }}>
          {/* Settings Button */}
          <ListItem button onClick={() => navigate("/settings")}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          
          {/* "My Activities" Button in Sidebar */}
          <ListItem
            button
            onClick={() => {
              navigate("/my-activities");
            }}
          >
            <ListItemIcon>
              <LocalActivityIcon />
            </ListItemIcon>
            <ListItemText primary="My Activities" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};
export default TopBar;
