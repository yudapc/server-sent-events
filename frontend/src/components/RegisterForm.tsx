import { FC, useEffect, useState } from 'react';
import { Box, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import RenderIf from './RenderIf';
import axios from 'axios';

type RegisterFormInterface = {
  onLoginClick: () => void;
}

const RegisterForm: FC<RegisterFormInterface> = ({ onLoginClick }) => {
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const apiHost = process.env.REACT_APP_API_HOST;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      await axios.post(`${apiHost}/register`, { email: registerEmail, username: registerUsername, password: registerPassword });
  
      alert('Register success');
      setRegisterEmail('');
      setRegisterUsername('');
      setRegisterPassword('');
      onLoginClick();
    } catch (error) {
      alert('Register failed');
    }
  };

  return (
    <RenderIf isTrue={!isLoggedIn}>
      <Box maxW="400px" margin="auto">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <FormControl id="email" mb={4}>
            <FormLabel>Email:</FormLabel>
            <Input
              type="email"
              value={registerEmail}
              onChange={e => setRegisterEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="username" mb={4}>
            <FormLabel>Username:</FormLabel>
            <Input
              type="text"
              value={registerUsername}
              onChange={e => setRegisterUsername(e.target.value)}
            />
          </FormControl>
          <FormControl id="password" mb={4}>
            <FormLabel>Password:</FormLabel>
            <Input
              type="password"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full">
            Register
          </Button>
          <Button
            onClick={onLoginClick}
            colorScheme="teal"
            width="full"
            mt={4}
          >
            Back to Login
          </Button>
        </form>
      </Box>
    </RenderIf>
  );
}

export default RegisterForm;
