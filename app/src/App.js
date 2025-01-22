import React, { useState } from 'react'; // Add useState import
import logo from './logo.svg';
import './App.css';
import LoginPage from './Login'; // Make sure LoginPage.js exists in the same directory

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
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
  );
}

export default App;