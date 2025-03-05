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
  Switch,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  NotificationsOff as NotificationsOffIcon,
  NotificationsActive as NotificationsActiveIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

import { doc, updateDoc } from "firebase/firestore";

import { signOut } from "firebase/auth";
import { auth, db } from "../util/firebase";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth"

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = (open) => () => {
    setSidebarOpen(open);
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleToggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled);
    const user = auth.currentUser;
    await updateDoc(doc(db, "users", user.uid), {
      allowNotifications: !notificationsEnabled,
    });
  };

  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <>
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
            <Avatar
              src={user?.photoURL || null} 
              sx={{ bgcolor: "#1976d2", cursor: "pointer" }}
              onClick={toggleSidebar(true)}
            >
              {/* Fallback: if there is no photoURL, display first letter of the user's email */}
              {!user?.photoURL && auth.currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={sidebarOpen} onClose={toggleSidebar(false)}>
        <List sx={{ width: 250 }}>
          <ListItem>
            <ListItemIcon>
              {notificationsEnabled ? (
                <NotificationsActiveIcon />
              ) : (
                <NotificationsOffIcon />
              )}
            </ListItemIcon>
            <ListItemText primary="Enable Notifications" />
            <Switch
              edge="end"
              checked={notificationsEnabled}
              onChange={handleToggleNotifications}
              inputProps={{ "aria-label": "toggle notifications" }}
            />
          </ListItem>

          <Divider />

          {/* Settings Button */}
          <ListItem button onClick={() => navigate("/settings")}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default TopBar;
