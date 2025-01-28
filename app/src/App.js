import React, { useState, useEffect } from "react"; // Add useState import
import logo from "./logo.svg";
import "./App.css";
import { auth } from "./Firebase"; // Add auth import
import { onAuthStateChanged, signOut } from "firebase/auth";
import LoginPage from "./Login"; // Make sure LoginPage.js exists in the same directory

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        console.log("User is signed in:", user.email);
      } else {
        setIsLoggedIn(false);
        console.log("No user signed in");
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
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

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome user</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        {/* <button onClick={() => setIsLoggedIn(false)}>Logout</button> */}
        <button onClick={handleLogout}>Logout</button>
      </header>
    </div>
  );
}

export default App;
