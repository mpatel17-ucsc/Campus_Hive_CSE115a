import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "./Firebase";
import { doc, setDoc } from "firebase/firestore";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
=======
import { GoogleAuthProvider } from "firebase/auth";
>>>>>>> 79f5b2a (Cleaner login page)

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

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
    setError("");
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("If an account with this email exists, a password reset email has been sent.");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFBF00",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        {/* Logo Section */}
        <div style={{ marginBottom: "20px" }}>
          <img
            src="hive.png" // Replace with your logo URL
            alt="App Logo"
            style={{ width: "100px", marginBottom: "10px" }}
          />
          <h1 style={{ fontSize: "24px", color: "#333", fontWeight: "bold" }}>Campus Hive</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: "10px",
                marginBottom: "20px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                borderRadius: "4px",
              }}
            >
              {error}
            </div>
          )}

          {(message || successMessage) && (
            <div
              style={{
                padding: "10px",
                marginBottom: "20px",
<<<<<<< HEAD
                backgroundColor: "#ecfee2",
                color: "#166534",
=======
                backgroundColor: "#d1fae5",
                color: "#065f46",
>>>>>>> 79f5b2a (Cleaner login page)
                borderRadius: "4px",
              }}
            >
              {message || successMessage}
            </div>
          )}

          <div style={{ marginBottom: "15px", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "90%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
              placeholder="name@example.com"
            />
          </div>

          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "90%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            color: "#666",
          }}
        >
          Don’t have an account? {" "}
          <button
            onClick={() => navigate("/signup")}
            style={{
              color: "#3b82f6",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sign up
          </button>
        </div>

        <div
          style={{
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleGoogleSignIn}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#db4437",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#c4382f")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#db4437")}
          >
            Sign in with Google
          </button>
        </div>

        <div
          style={{
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleReset}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#d97706")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#f59e0b")}
          >
            Forgot Password? Send Reset Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
