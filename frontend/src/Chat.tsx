import React, { useState, useEffect } from 'react';
import MessageForm from './MessageForm';

function Chat() {
  const [messages, setMessages] = useState<any>([]);

  useEffect(() => {
    // Fetch existing messages
    fetch('http://localhost:8080/messages')
      .then(res => res.json())
      .then(data => setMessages(data));

    // Connect to SSE
    const eventSource = new EventSource('http://localhost:8080/events');
    
    eventSource.addEventListener('newMessage', function(event) {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages: any) => [...prevMessages, newMessage]);
    });

    eventSource.addEventListener('updateMessage', function(event) {
      const updatedMessage = JSON.parse(event.data);
      setMessages((prevMessages: any) => prevMessages.map((msg: any) => msg.id === updatedMessage.id ? updatedMessage : msg));
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <ul>
        {messages.map((message: any) => (
          <li key={message.id}>
            {message.content} - <small>{new Date(message.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
      <MessageForm />
    </div>
  );
}

export default Chat;
