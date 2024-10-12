import { FC, memo, useEffect, useState } from 'react';
import { Box, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import RenderIf from './RenderIf';
import axios from 'axios';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(`${apiHost}/login`, { username, password });
  
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.user.username);
      setIsLoggedIn(true);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      alert('Login failed');
    }
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
