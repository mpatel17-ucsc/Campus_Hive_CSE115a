import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar, Typography, IconButton, Avatar, Container, Card, CardContent, CardMedia, CircularProgress, styled } from "@mui/material";
import { Add as AddIcon, Home as HomeIcon, Logout as LogoutIcon } from "@mui/icons-material";
import { auth } from "./Firebase";
import { signOut } from "firebase/auth";


// Styled components
const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
});

const IconsContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const HomeComponent = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar position="fixed" color="default" elevation={1}>
        <StyledToolbar>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            Campus Hive
          </Typography>

          <IconsContainer>
            <IconButton color="inherit" onClick={() => navigate("/create-activity")} title="Create Post">
              <AddIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate("/home")} title="Home">
              <HomeIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => signOut(auth)} title="Logout">
              <LogoutIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: "#1976d2" }}>
              {auth.currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconsContainer>
        </StyledToolbar>
      </AppBar>
    </Box>
  );
};

export default HomeComponent;
