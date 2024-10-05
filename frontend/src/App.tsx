// import React from 'react';
// import logo from './logo.svg';
import { useEffect, useState } from 'react';
import './App.css';
import Chat from './Chat';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    const username = localStorage.getItem('username');
    if (username) {
      setUsername(username);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    }).then(res => res.json()).then((data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      setIsLoggedIn(true);
    });
  };
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername('');
  };
  return (
    <div className="App">
      {isLoggedIn ? (
        <>
          <button onClick={handleLogout}>{username} Log out</button>
          <Chat />
        </>
      ) : (
        <form onSubmit={handleLogin}>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <input type="submit" value="Log in" />
        </form>
      )}
    </div>
  );
}

export default App;
