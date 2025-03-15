import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth"; // firebase function for creating user with email and password
import { auth, db } from "../util/firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  collection,
} from "firebase/firestore"; // firebase functions for storing user data in firestore
import { useNavigate } from "react-router-dom"; // react router dom for navigation/redirection

const SignUp = () => {
  // state variables for email, password, confirm password, error message, and loading state
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      console.log(querySnapshot.docs.map((doc) => doc.data().username));
      setUsers(querySnapshot.docs.map((doc) => doc.data().username));
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to check username availability
  const checkUsernameAvailability = (enteredUsername) => {
    if (!enteredUsername.trim()) return;
    setIsAvailable(!users.includes(enteredUsername));
  };

  // function to handle sign up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // regex for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Username validation
    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      setIsLoading(false);
      return;
    }

    // Check username availability before proceeding
    if (!isAvailable) {
      setError("Username is already taken. Please choose another.");
      setIsLoading(false);
      return;
    }

    // check if password is at least 8 characters long
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    // check if password and confirm password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // create user in firebase and store user data in firestore
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // store user data in firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username,
        createdAt: serverTimestamp(),
      });

      // clear input fields and navigate to login page
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setError("");

      // Redirect to home page
      navigate("/home");

      // navigate to login page with success message upon successful sign up
      //navigate("/login", {
      //  state: { message: "Account created successfully. Please log in!" },
      //});
    } catch (error) {
      setError(error.message); // set Firebase authentication error message if sign up fails
    } finally {
      setIsLoading(false); // reset loading state
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Sign Up</h1>

      {/* display error message if sign up fails */}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {/* Sign-up form */}
      <form onSubmit={handleSignUp}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on input change required
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              checkUsernameAvailability(e.target.value); // Check username availability on change
            }}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: `1px solid ${isAvailable ? "#ccc" : "red"}`,
              borderRadius: "4px",
            }}
          />
          {username &&
            (isAvailable ? (
              <p style={{ color: "green", fontSize: "12px" }}>
                Username is available
              </p>
            ) : (
              <p style={{ color: "red", fontSize: "12px" }}>
                Username is already taken
              </p>
            ))}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on input change required
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Update confirm password state on input change required
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading} // disable button if loading
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isLoading ? "Signing up..." : "Sign Up"}{" "}
          {/* Change button text while loading */}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
