// import React from 'react';
// import logo from './logo.svg';
import { useEffect, useState } from 'react';
import './App.css';
import Room from './Room';

function App() {
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const apiHost = process.env.REACT_APP_API_HOST;

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

    fetch(`${apiHost}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    }).then(res => res.json()).then((data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      setIsLoggedIn(true);
    }).catch(() => {
      alert('Login failed');
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    fetch(`${apiHost}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: registerEmail, username: registerUsername, password: registerPassword }),
    }).then(res => res.json()).then((data) => {
      alert('Register success');
      setRegisterEmail('');
      setRegisterUsername('');
      setRegisterPassword('');
    }).catch(() => {
      alert('Register failed');
    });
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <>
          <Room />
        </>
      ) : (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div>
              <label>
                Username:
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Password:
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </label>
              <input type="submit" value="Log in" />
            </div>
          </form>
          <br />
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <div>
              <label>
                Email:
                <input
                  type="email"
                  value={registerEmail}
                  onChange={e => setRegisterEmail(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Username:
                <input
                  type="text"
                  value={registerUsername}
                  onChange={e => setRegisterUsername(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Password:
                <input
                  type="password"
                  value={registerPassword}
                  onChange={e => setRegisterPassword(e.target.value)}
                />
              </label>
              <input type="submit" value="Log in" />
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
