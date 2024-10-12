import React, { useState, useEffect, useRef } from 'react';
import MessageForm from './MessageForm';
import RenderIf from './RenderIf';
import { requestNotificationPermission, showNotification } from '../helpers/notification';
import { Box, Flex, List, ListItem, Text, VStack } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

function Chat({ roomID, handleBack }: any) {
  const [messages, setMessages] = useState<any>([]);
  const [token, setToken] = useState('');
  const [me, setMe] = useState('');
  const [userPartner, setUserPartner] = useState('');
  const messagesEndRef = React.useRef<HTMLUListElement | null>(null);
  const apiHost = process.env.REACT_APP_API_HOST;
  const [height, setHeight] = useState("100vh");

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
      axios.get(`${apiHost}/rooms/${roomID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          const data = response.data;
          setMessages(data.messages);
          const partner = data.users.find((user: any) => user.username !== me);
          setUserPartner(partner.username || '');
        })
        .catch(error => {
          console.error('An error occurred while fetching the room:', error);
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
    const countMessages = messages.length;
    if (messagesEndRef.current) {
      if (countMessages < 4) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setHeight((countMessages * 15) + 'vh');
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        setHeight((countMessages * 10) + 'vh');
      }
    }
  }, [messages]);

  useEffect(() => {
    // Request notification permission when the component mounts
    requestNotificationPermission();
  }, []);


  const handleBackButton = () => {
    setHeight("100vh");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      handleBack();
    }, 500);
  };

  return (
    <VStack width="100%" height={`calc(${height}-250vh)`} padding="1" spacing="1" justifyContent="space-between">
      <Box width="100%" flex="1" maxH={`calc(${height}-250vh)`} >
        <RenderIf isTrue={Boolean(roomID)}>
          <>
            <Flex position="sticky" top="0" bg="white" p="2" zIndex="1" alignItems="center" justifyContent="space-between">
              <ArrowBackIcon onClick={handleBackButton} cursor="pointer" fontSize="24px" />
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
        <MessageForm token={token} roomID={roomID} messagesEndRef={messagesEndRef} countMessages={messages.length} setHeight={setHeight} />
      </Flex>
    </VStack>
  );
}

export default Chat;
