import React, { useState } from 'react';
import './App.css';
import { useAuth } from './AuthContext.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Home from './components/Home.jsx';

function App() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (user) return <Home />;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setShowRegister(false)} aria-pressed={!showRegister}>Login</button>
        <button onClick={() => setShowRegister(true)} aria-pressed={showRegister}>Sign Up</button>
      </div>
      {showRegister ? <Register /> : <Login />}
    </div>
  );
}

export default App;
