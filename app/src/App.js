import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CircularProgress, Box } from "@mui/material";

import Login from "./pages/login";
import SignUp from "./pages/signUp";
import CreateActivity from "./pages/createActivity";
import Home from "./pages/home";
import { auth } from "./util/firebase";
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
  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
          />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </ThemeProvider>
    );
  } else {
    return (
      <ThemeProvider theme={theme}>
        <Routes>
          {/* Redirect to home or login based on login state */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Sign Up Route */}
          <Route path="/signup" element={<SignUp />} />

          {/* Home Route - Now correctly showing HomeComponent */}
          <Route
            path="/home"
            element={<Home onLogout={() => setIsLoggedIn(false)} />}
          />

          <Route path="/create-activity" element={<CreateActivity />} />

          {/* <Route */}
          {/*   path="/test" */}
          {/*   element={ */}
          {/*     isLoggedIn ? <LocationPicker /> : <Navigate to="/login" replace /> */}
          {/*   } */}
          {/* /> */}
        </Routes>
      </ThemeProvider>
    );
  }
};

export default App;
