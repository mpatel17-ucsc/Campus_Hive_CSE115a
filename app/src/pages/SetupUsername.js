import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../util/firebase";
import { Box, TextField, Button, Typography, CircularProgress, Alert } from "@mui/material";

const SetupUsername = () => {
  const { uid, email } = useParams();
  const navigate = useNavigate();

  // If uid or email are missing, redirect user to login page
  useEffect(() => {
    if (!uid || !email) {
      console.error("Missing UID or email, redirecting...");
      navigate("/login");
    }
  }, [uid, email, navigate]);
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState("");

  // Function to check username availability
  const checkUsernameAvailability = async (enteredUsername) => {
    if (!enteredUsername.trim()) return;

    setIsChecking(true);
    const q = query(collection(db, "users"), where("username", "==", enteredUsername));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setIsAvailable(false);
    } else {
      setIsAvailable(true);
    }
    setIsChecking(false);
  };

  // Function to set username
  const handleSetUsername = async () => {
    if (!isAvailable) {
      setError("Username is already taken. Please choose another.");
      return;
    }

    try {
      await setDoc(doc(db, "users", uid), { username, email }, { merge: true });
      console.log("Username set successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "/home"; // Hard redirect
      }, 500); // Redirect user to home after setting username
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center" }}>Set Up Your Username</h2>
      
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      
      <input
        type="text"
        placeholder="Enter a unique username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          checkUsernameAvailability(e.target.value); // Check username availability
        }}
        required
        style={{
          width: "100%",
          padding: "8px",
          border: `1px solid ${isAvailable === false ? "red" : "#ccc"}`,
          borderRadius: "4px",
        }}
      />
      
      {isChecking && <p style={{ color: "gray", fontSize: "12px" }}>Checking username...</p>}
      {isAvailable === false && <p style={{ color: "red", fontSize: "12px" }}>Username is already taken</p>}
      {isAvailable === true && <p style={{ color: "green", fontSize: "12px" }}>Username is available</p>}

      <button 
        onClick={handleSetUsername} 
        disabled={!isAvailable}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Set Username
      </button>
    </div>
  );
};

export default SetupUsername;

