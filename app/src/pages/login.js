import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { auth, db } from "../util/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = ({ onLoginSuccess }) => {
  // State variables defined here
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false); // Separate loading state for password reset
  const navigate = useNavigate();

  // Function to handle email/password submissions/login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      onLoginSuccess();
      navigate("/home");
    } catch (err) {
      // error handling on failure
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google authentication function
  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log(
        "Google Sign-In Successful! UID:",
        user.uid,
        "Email:",
        user.email,
      ); // Check UID

      // Check if user already has a username
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().username) {
        console.log("Redirecting to setup-username...");
        navigate(
          `/setup-username/${user.uid}/${encodeURIComponent(user.email)}`,
        );
        return;
      }

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        lastLogin: new Date().toISOString(),
        username: userSnap.data().username,
      });

      onLoginSuccess();
      navigate("/home");
    } catch (err) {
      console.error("Google Sign-In Error:", err.message); // Logs any errors
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the reset password
  const handleReset = async () => {
    if (!email) {
      setError("Please enter an email address");
      return;
    }
    // (long) regex for email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setIsResetLoading(true); // Set loading for password reset
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setError("");
        // Success message display
        setMessage(
          "If an account with this email exists, a password reset email has been sent.",
        );
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setIsResetLoading(false); // Reset loading after the reset process completes
      });
  };

  return (
    <Container
      maxWidth="false"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundImage:
          "url('https://www.patternpictures.com/wp-content/uploads/Honeycomb-Gold-And-Blue-Background-Pattern171109-1600x924.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        flexDirection: "row", // Align items horizontally
      }}
    >
      {/* Left Side with Title and Description */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "50%",
          color: "white",
          padding: 4,
        }}
      >
        <Typography
          sx={{
            padding: 4,
            borderRadius: 2,
            textAlign: "center",
            backgroundColor: "black",
            color: "white",
            display: "flex",
            flexDirection: "column",
          }}
          variant="h3"
          fontWeight="bold"
          gutterBottom
        >
          Campus Hive
        </Typography>
        <Typography
          variant="h6"
          sx={{
            padding: 4,
            borderRadius: 2,
            textAlign: "center",
            backgroundColor: "black",
            color: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          Discover top-rated experiences, hidden gems, and honest reviews from
          students and locals alike!
        </Typography>
      </Box>

      {/* Right Side with Form */}
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          textAlign: "center",
          backgroundColor: "black",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "50%", // Take up half the screen
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Welcome Back
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", mt: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              mb: 2,
              input: { color: "white" },
              label: { color: "white" },
              fieldset: { borderColor: "white" },
            }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              mb: 1,
              input: { color: "white" },
              label: { color: "white" },
              fieldset: { borderColor: "white" },
            }}
          />

          <Typography
            variant="caption"
            color="gray"
            sx={{
              cursor: "pointer",
              mb: 2,
              display: "flex",
              justifyContent: "flex-end",
            }}
            onClick={handleReset}
          >
            Forgot Password?
          </Typography>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              mb: 1,
              backgroundColor: "black",
              border: "2px solid yellow",
              color: "yellow",
              "&:hover": { backgroundColor: "yellow", color: "black" },
            }}
          >
            {isLoading ? "Please wait..." : "Sign In"}
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="gray"
          sx={{ cursor: "pointer", mt: 1 }}
          onClick={() => navigate("/signup")}
        >
          New? Sign-Up
        </Typography>

        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
