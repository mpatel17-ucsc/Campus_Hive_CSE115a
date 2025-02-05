import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase";
import {
  Add as AddIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const navigate = useNavigate();
  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Campus Hive
        </Typography>
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
          <IconButton
            color="inherit"
            onClick={() => signOut(auth)}
            title="Logout"
          >
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
