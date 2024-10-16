import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton, List, ListItem, Text, VStack } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { requestNotificationPermission, showNotification } from '../helpers/notification';
import MessageForm from './MessageForm';
import RenderIf from './RenderIf';

function Chat({ roomID, handleBack }: any) {
  const [messages, setMessages] = useState<any>([]);
  const [token, setToken] = useState('');
  const [me, setMe] = useState('');
  const [userPartner, setUserPartner] = useState('');
  const messagesEndRef = React.useRef<HTMLUListElement | null>(null);
  const apiHost = process.env.REACT_APP_API_HOST;
  const [height, setHeight] = useState('100vh');

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
      axios
        .get(`${apiHost}/rooms/${roomID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const data = response.data;
          setMessages(data.messages);
          const partner = data.users.find((user: any) => user.username !== me);
          setUserPartner(partner.username || '');
        })
        .catch((error) => {
          console.error('An error occurred while fetching the room:', error);
        });

      // Connect to SSE
      const eventSource = new EventSource(`${apiHost}/events/${roomID}`);

      eventSource.addEventListener('newMessage', function (event) {
        try {
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
        } catch (error) {
          console.error('An error occurred while parsing newMessage:', error);
        }
      });

      eventSource.addEventListener('updateMessage', function (event) {
        const updatedMessage = JSON.parse(event.data);
        setMessages((prevMessages: any) =>
          prevMessages.map((msg: any) => (msg.id === updatedMessage.id ? updatedMessage : msg))
        );
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
        setHeight(countMessages * 15 + 'vh');
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        setHeight(countMessages * 10 + 'vh');
      }
    }
  }, [messages]);

  useEffect(() => {
    // Request notification permission when the component mounts
    requestNotificationPermission();
  }, []);

  const handleBackButton = () => {
    setHeight('100vh');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      handleBack();
    }, 500);
  };

  return (
    <VStack
      width="100%"
      height={`calc(${height}-250vh)`}
      padding="1"
      spacing="1"
      justifyContent="space-between"
      style={{
        backgroundImage: "url('/icons/background-chat.png')", // Replace with your image path
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      <Box width="100%" flex="1" maxH={`calc(${height}-250vh)`}>
        <RenderIf isTrue={Boolean(roomID)}>
          <>
            <Flex
              position="sticky"
              top="0"
              bg="transparent"
              p="2"
              zIndex="1"
              alignItems="center"
              justifyContent="space-between"
              mt="-25px"
              ml="-5px"
              mr="-5px"
            >
              <IconButton
                aria-label="Back button"
                icon={<ArrowBackIcon fontSize="24px" />}
                onClick={handleBackButton}
                cursor="pointer"
                isRound
                bg="gray.200"
              />
              <Text fontSize="xl" fontWeight="bold">
                {userPartner}
              </Text>
              <Text />
            </Flex>
            <List mt="3px" pl="10px" pr="10px">
              {messages.map((message: any, index: number) => {
                const messageDate = new Date(message.timestamp);
                const today = new Date();

                const isToday =
                  messageDate.getDate() === today.getDate() &&
                  messageDate.getMonth() === today.getMonth() &&
                  messageDate.getFullYear() === today.getFullYear();

                const displayDate = isToday
                  ? new Intl.DateTimeFormat('default', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(messageDate)
                  : messageDate.toLocaleString();

                const nextMessage = messages[index + 1];
                const isNextAfterChange =
                  nextMessage?.username !== message.username || nextMessage?.username === undefined;
                const prevMessage = messages[index - 1];
                const isPrevBeforeChange =
                  prevMessage?.username !== message.username || prevMessage?.username === undefined;

                return (
                  <ListItem
                    key={message.id}
                    textAlign={me === message.username ? 'right' : 'left'}
                    mt="5px"
                  >
                    <RenderIf isTrue={isPrevBeforeChange}>
                      <Text fontSize={12}>
                        <strong>{me === message.username ? 'You' : ''}</strong>
                      </Text>
                    </RenderIf>
                    <Box
                      bg={me === message.username ? '#e3ffca' : 'white'}
                      borderRadius="lg"
                      borderBottomRightRadius={me === message.username ? '4px' : 'lg'}
                      borderBottomLeftRadius={me !== message.username ? '4px' : 'lg'}
                      p="1"
                      ml={me === message.username ? 'auto' : '0'}
                      textAlign={me === message.username ? 'right' : 'left'}
                      display="inline-block"
                      maxWidth="90%"
                      position="relative"
                      boxShadow="0px 3px 6px #00000029"
                    >
                      <Box
                        fontSize="12px"
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        height="100%"
                      >
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                        <Text fontSize={10} textAlign="right">
                          {displayDate}
                        </Text>
                      </Box>
                      <RenderIf isTrue={isNextAfterChange}>
                        <Box
                          position="absolute"
                          bottom="-10px"
                          right={me === message.username ? '-6px' : 'unset'}
                          left={me === message.username ? 'unset' : '-6px'}
                          width="0"
                          height="0"
                          borderRight={me === message.username ? '10px solid transparent' : 'unset'}
                          borderLeft={me === message.username ? 'unset' : '10px solid transparent'}
                          borderTop={`10px solid ${me === message.username ? '#e3ffca' : 'white'}`}
                          borderBottom="10px solid transparent"
                        />
                      </RenderIf>
                    </Box>
                  </ListItem>
                );
              })}
              <div ref={messagesEndRef as React.MutableRefObject<HTMLDivElement | null>} />
            </List>
          </>
        </RenderIf>
      </Box>
      <Flex
        position="sticky"
        bottom="0"
        bg="white"
        p="2"
        zIndex="1"
        w="100%"
        background="transparent"
      >
        <MessageForm
          token={token}
          roomID={roomID}
          messagesEndRef={messagesEndRef}
          countMessages={messages.length}
          setHeight={setHeight}
        />
      </Flex>
    </VStack>
  );
}

export default Chat;
