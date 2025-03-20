import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CircularProgress, Box } from "@mui/material";

import Login from "./pages/login";
import SetupUsername from "./pages/SetupUsername";
import SignUp from "./pages/signUp";
import CreateActivity from "./pages/createActivity";
import MyActivities from "./pages/myActivities";
import Home from "./pages/home";
import Settings from "./pages/settings";
import ActivityDetail from "./pages/activityDetail";

import { auth, db } from "./util/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

const theme = createTheme(); // Create a default Material-UI theme

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresUsernameSetup, setRequiresUsernameSetup] = useState(false);
  // UseEffect hook to listen on changes to Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);

        try {
          // Get the user's document from Firestore
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists() || !userSnap.data()?.username) {
            console.log("User needs to set up a username.");
            setRequiresUsernameSetup(true);
          } else {
            console.log(
              "User already has a username:",
              userSnap.data().username,
            );
            setRequiresUsernameSetup(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // setRequiresUsernameSetup(false);
        }
      } else {
        console.log("User is not logged in.");
        setIsLoggedIn(false);
        setRequiresUsernameSetup(false);
      }
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

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        {/* If user needs to set up a username, redirect to setup page */}
        {requiresUsernameSetup ? (
          <>
            <Route
              path="/setup-username/:uid/:email"
              element={<SetupUsername />}
            />
            <Route
              path="*"
              element={
                auth.currentUser ? (
                  <Navigate
                    to={`/setup-username/${auth.currentUser.uid}/${encodeURIComponent(auth.currentUser.email)}`}
                    replace
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </>
        ) : isLoggedIn ? (
          <>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="/home"
              element={<Home onLogout={() => setIsLoggedIn(false)} />}
            />
            <Route path="/create-activity" element={<CreateActivity />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-activities" element={<MyActivities />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/login"
              element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
            />
            <Route path="/signup" element={<SignUp />} />
          </>
        )}
      </Routes>
    </ThemeProvider>
  );
};

/*
  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
          />
          <Route path="/setup-username" element={<SetupUsername />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </ThemeProvider>
    );
  } else {
    return (
      <ThemeProvider theme={theme}>
        <Routes>
          
          <Route path="/" element={<Navigate to="/home" replace />} />

          
          <Route path="/signup" element={<SignUp />} />

          
          <Route
            path="/home"
            element={<Home onLogout={() => setIsLoggedIn(false)} />}
          />

          <Route path="/create-activity" element={<CreateActivity />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/my-activities" element={<MyActivities />} />

          <Route path="/activity/:id" element={<ActivityDetail />} />

        </Routes>
      </ThemeProvider>
    );
  }
};
*/

export default App;
