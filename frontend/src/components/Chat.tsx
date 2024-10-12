import React, { useState, useEffect } from 'react';
import MessageForm from './MessageForm';
import RenderIf from './RenderIf';
import { requestNotificationPermission, showNotification } from '../helpers/notification';
import { Box, Flex, List, ListItem, Text, VStack } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import ReactMarkdown from 'react-markdown';

function Chat({ roomID, handleBack }: any) {
  const [messages, setMessages] = useState<any>([]);
  const [token, setToken] = useState('');
  const [me, setMe] = useState('');
  const [userPartner, setUserPartner] = useState('');
  const messagesEndRef = React.useRef<HTMLUListElement | null>(null);
  const apiHost = process.env.REACT_APP_API_HOST;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }

    const username = localStorage.getItem('username');
    if (username) {
      setMe(username);
    }
  }, []);

  useEffect(() => {
    if (token && roomID) {
      // Fetch existing messages
      fetch(`${apiHost}/rooms/${roomID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setMessages(data.messages);
          const partner = data.users.find((user: any) => user.username !== me);
          setUserPartner(partner.username || '');
        });

      // Connect to SSE
      const eventSource = new EventSource(`${apiHost}/events/${roomID}`);

      eventSource.addEventListener('newMessage', function (event) {
        const newMessage = JSON.parse(event.data);
        setMessages((prevMessages: any) => [...prevMessages, newMessage]);
        if (me !== newMessage.username) {
          const options = {
            body: `${newMessage.username}: ${newMessage.content}`,
            icon: './logo.svg', // Optional icon
            vibrate: [200, 100, 200], // Optional vibration pattern for mobile devices
          };
          showNotification('New Message', options);
        }
      });

      eventSource.addEventListener('updateMessage', function (event) {
        const updatedMessage = JSON.parse(event.data);
        setMessages((prevMessages: any) => prevMessages.map((msg: any) => msg.id === updatedMessage.id ? updatedMessage : msg));
      });

      eventSource.addEventListener('error', function (event) {
        // localStorage.clear();
        // window.location.reload();
        console.log('error connecting to server');
      });

      return () => {
        eventSource.close();
      };
    }
  }, [token, roomID]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Request notification permission when the component mounts
    requestNotificationPermission();
  }, []);

  return (
    <VStack width="100%" height="100vh" padding="1" spacing="1" justifyContent="space-between">
      <Box width="100%">
        <RenderIf isTrue={Boolean(roomID)}>
          <>
            <Flex position="sticky" top="0" bg="white" p="2" zIndex="1" alignItems="center" justifyContent="space-between">
              <ArrowBackIcon onClick={() => handleBack()} cursor="pointer" fontSize="24px" />
              <Text fontSize="xl">{userPartner}</Text>
              <Text />
            </Flex>
            <List spacing={3}>
              {messages.map((message: any) => {
                const messageDate = new Date(message.timestamp);
                const today = new Date();

                const isToday = messageDate.getDate() === today.getDate() &&
                  messageDate.getMonth() === today.getMonth() &&
                  messageDate.getFullYear() === today.getFullYear();

                const displayDate = isToday ?
                  new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit' }).format(messageDate) :
                  messageDate.toLocaleString();
                return (

                  <ListItem key={message.id} textAlign={me === message.username ? 'right' : 'left'}>
                    <Box
                      bg={me === message.username ? 'green.200' : 'yellow.200'}
                      borderRadius="lg"
                      p="2"
                      ml={me === message.username ? 'auto' : '0'}
                      textAlign={me === message.username ? 'right' : 'left'}
                      display="inline-block"
                      maxWidth="90%"
                    >
                      <Text fontSize={13}>
                        <strong>{me === message.username ? 'You' : message.username}</strong>{' '}
                        {displayDate}
                      </Text>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </Box>
                  </ListItem>
                )
              })}
              <div ref={messagesEndRef as React.MutableRefObject<HTMLDivElement | null>} />
            </List>
          </>
        </RenderIf>
      </Box>
      <Flex position="sticky" bottom="0" bg="white" p="2" zIndex="1" width="100%">
        <MessageForm token={token} roomID={roomID} />
      </Flex>
    </VStack>
  );
}

export default Chat;
