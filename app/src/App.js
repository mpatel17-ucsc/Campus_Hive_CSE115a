import React, { useState } from "react"; // Add useState import
import logo from "./logo.svg";
import "./App.css";
import Login from "./Login"; // Make sure Login.js exists in the same directory
import SignUp from "./SignUp";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Redirect to home or login based on login state */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />}
        />

        {/* Sign Up Route */}
        <Route path="/signup" element={<SignUp />} />

        {/* Home Route */}
        <Route
          path="/home"
          element={
            isLoggedIn ? (
              <div className="App">
                <header className="App-header">
                  <img src={logo} className="App-logo" alt="logo" />
                  <p>
                    Edit <code>src/App.js</code> and save to reload.
                  </p>
                  <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn React
                  </a>
                  <button onClick={() => setIsLoggedIn(false)}>Logout</button>
                </header>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

