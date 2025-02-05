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
import { auth, db } from "./Firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle manual login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        lastLogin: new Date().toISOString(),
      });
      onLoginSuccess();
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        lastLogin: new Date().toISOString(),
      });

      onLoginSuccess();
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleReset = async () => {
    console.log("Reset password");
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    // Email validation regex
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setError("");
        setMessage(
          "If an account with this email exists, a password reset email has been sent.",
        );
      })
      .catch((error) => {
        const errorMessage = error.message;
        setError(errorMessage);
      });
  };

  return (
    <Container maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          mt: 8,
          borderRadius: 2,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
            sx={{ mb: 2 }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            {isLoading ? "Please wait..." : "Sign In"}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 1 }}>
          Don't have an account?{" "}
          <Button color="primary" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
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

        <Button
          variant="outlined"
          color="error"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleReset}
        >
          Forgot Password? Send Reset Email
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
