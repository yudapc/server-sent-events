import { FC, memo, useEffect, useState } from 'react';
import { Box, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import RenderIf from './RenderIf';

type LoginFormProps = {
  onRegisterClick: () => void;
}

const LoginForm: FC<LoginFormProps> = ({ onRegisterClick }) => {
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
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }).catch(() => {
      alert('Login failed');
    });
  };

  return (
    <RenderIf isTrue={!isLoggedIn}>
      <Box maxW="400px" margin="auto">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <FormControl id="username" mb={4}>
            <FormLabel>Username:</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl id="password" mb={4}>
            <FormLabel>Password:</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full">
            Log in
          </Button>
          <Button
            onClick={onRegisterClick}
            colorScheme="teal"
            width="full"
            mt={4}
          >
            Register
          </Button>
        </form>
      </Box>
    </RenderIf>
  );
}

export default memo(LoginForm);
