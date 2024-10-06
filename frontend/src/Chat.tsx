import React, { useState, useEffect } from 'react';
import MessageForm from './MessageForm';
import RenderIf from './components/RenderIf';
import { requestNotificationPermission, showNotification } from './helpers/notification';

function Chat({ roomID, handleBack }: any) {
  const [messages, setMessages] = useState<any>([]);
  const [token, setToken] = useState('');
  const [me, setMe] = useState('');
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
        .then(data => setMessages(data.messages));

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
    <div>
      <RenderIf isTrue={Boolean(roomID)}>
        <>
          <div>
            <a href="#" onClick={() => handleBack()}>Back</a>
            <h1>Chat</h1>
          </div>
          <ul ref={messagesEndRef} style={{ listStyleType: 'none', height: 'auto', padding: 0 }}>
            {messages.map((message: any) => (
              <li
                key={message.id}
                style={{
                  textAlign: me === message.username ? 'right' : 'left',
                  padding: '10px',
                  marginLeft: me === message.username ? '65%' : 'auto',
                  marginRight: me === message.username ? 'auto' : '65%',
                }}
              >
                <div
                  style={{
                    textAlign: me === message.username ? 'right' : 'left',
                    padding: '10px',
                    background: me === message.username ? '#ccffcc' : 'rgb(245 255 204)',
                    borderRadius: '10px',
                  }}
                >

                  <strong>{me === message.username ? 'You' : message.username}</strong>  <small>{new Date(message.timestamp).toLocaleString()}</small>
                  <br />
                  {message.content}
                </div>
              </li>
            ))}
          </ul>
          <MessageForm token={token} roomID={roomID} />
        </>
      </RenderIf>
    </div>
  );
}

export default Chat;
