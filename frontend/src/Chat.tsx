import React, { useState, useEffect } from 'react';
import MessageForm from './MessageForm';

function Chat() {
  const [messages, setMessages] = useState<any>([]);
  const [token, setToken] = useState('');
  const [roomID, setRoomID] = useState('');
  const [me, setMe] = useState('');
  const messagesEndRef = React.useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }
    const roomID = localStorage.getItem('roomID');
    if (roomID) {
      setRoomID(roomID);
    }

    const username = localStorage.getItem('username');
    if (username) {
      setMe(username);
    }
  }, []);

  useEffect(() => {
    if (token && roomID) {
      // Fetch existing messages
      fetch(`http://localhost:8080/rooms/${roomID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => setMessages(data.messages));

      // Connect to SSE
      const eventSource = new EventSource(`http://localhost:8080/events/${roomID}`);

      eventSource.addEventListener('newMessage', function (event) {
        const newMessage = JSON.parse(event.data);
        setMessages((prevMessages: any) => [...prevMessages, newMessage]);
      });

      eventSource.addEventListener('updateMessage', function (event) {
        const updatedMessage = JSON.parse(event.data);
        setMessages((prevMessages: any) => prevMessages.map((msg: any) => msg.id === updatedMessage.id ? updatedMessage : msg));
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

  const saveRoomID = (roomID: string) => {
    localStorage.setItem('roomID', roomID);
    setRoomID(roomID);
  };

  const styleRight = {
    textAlign: 'right',
    padding: '10px',
    background: '#ccffcc',
    marginLeft: '60%'
  }

  const styleLeft = {
    textAlign: 'left',
    padding: '10px',
    background: '#ccffcc',
    marginRight: '60%'
  }

  return (
    <div>
      <input type="text" placeholder="Enter Room ID" defaultValue={roomID} onChange={(e) => saveRoomID(e.target.value)} />
      <ul ref={messagesEndRef} style={{ listStyleType: 'none', height: 'auto' }}>
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

              <strong>{message.username}</strong>  <small>{new Date(message.timestamp).toLocaleString()}</small>
              <br />
              {message.content}
            </div>
          </li>
        ))}
      </ul>
      <MessageForm token={token} roomID={roomID} />
    </div>
  );
}

export default Chat;
