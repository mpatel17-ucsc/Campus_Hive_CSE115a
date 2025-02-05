import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CircularProgress, Box } from "@mui/material";
import Login from "./Login";
import SignUp from "./SignUp";
import ActivityForm from "./ActivityForm";
import HomeComponent from "./HomeComponent";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";

const theme = createTheme(); // Create a default Material-UI theme



const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
        <Routes>
          {/* Redirect to home or login based on login state */}
          <Route path="/" element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
          
          {/* Login Route */}
          <Route path="/login" element={isLoggedIn ? <Navigate to="/home" replace /> : <Login onLoginSuccess={() => setIsLoggedIn(true)} />} />

          {/* Sign Up Route */}
          <Route path="/signup" element={<SignUp />} />

          {/* Home Route - Now correctly showing HomeComponent */}
          <Route path="/home" element={isLoggedIn ? <HomeComponent /> : <Navigate to="/login" replace />} />

          {/* Create Activity Route */}
          <Route path="/create-activity" element={isLoggedIn ? <ActivityForm /> : <Navigate to="/login" replace />} />
        </Routes>
    </ThemeProvider>
  );
};

export default App;