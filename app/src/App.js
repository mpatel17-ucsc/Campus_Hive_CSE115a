import React, { useState, useEffect } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
//import ActivityForm from "./ActivityForm";
import { auth } from "./Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  styled,
} from "@mui/material";
import {
  Add as AddIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

// Styled components
const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
});

const IconsContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const HomeComponent = () => (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" color="default" elevation={1}>
        <StyledToolbar>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Campus Hive
          </Typography>
          
          <IconsContainer>
            <IconButton
              color="inherit"
              onClick={() => navigate('/create-post')}
              title="Create Post"
            >
              <AddIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => navigate('/home')}
              title="Home"
            >
              <HomeIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              title="Logout"
            >
              <LogoutIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: '#1976d2' }}>
              {auth.currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconsContainer>
        </StyledToolbar>
      </AppBar>
    </Box>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/home" replace />
          ) : (
            <Login onLoginSuccess={() => setIsLoggedIn(true)} />
          )
        }
      />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/home"
        element={isLoggedIn ? <HomeComponent /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;