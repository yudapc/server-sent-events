import { ChakraProvider } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import RenderIf from './components/RenderIf';
import Room from './components/Room';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setShowLoginForm(false);
      setShowRegisterForm(false);
    }
  }, []);

  const onRegisterClick = () => {
    setShowLoginForm(false);
    setShowRegisterForm(true);
  };

  const onLoginClick = () => {
    setShowLoginForm(true);
    setShowRegisterForm(false);
  };

  return (
    <ChakraProvider>
      <Box className="App" p={4}>
        <RenderIf isTrue={isLoggedIn}>
          <Room />
        </RenderIf>
        <Box maxW="400px" margin="auto">
          <RenderIf isTrue={showLoginForm}>
            <LoginForm onRegisterClick={onRegisterClick} />
          </RenderIf>
          <RenderIf isTrue={showRegisterForm}>
            <RegisterForm onLoginClick={onLoginClick} />
          </RenderIf>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default App;
