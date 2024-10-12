import { Button, Textarea } from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';

interface MessageFormProps {
  token: string;
  roomID: string;
  messagesEndRef: React.RefObject<HTMLUListElement>;
  countMessages: number;
  setHeight: (height: string) => void;
}

function MessageForm({ token, roomID, messagesEndRef, countMessages, setHeight }: MessageFormProps) {
  const [content, setContent] = useState('');
  const apiHost = process.env.REACT_APP_API_HOST;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (content) {
      try {
        await axios.post(`${apiHost}/messages`, { content, room_id: roomID }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        setContent('');
      } catch (error) {
        console.error('An error occurred while sending the message:', error);
      }
    }
  };

  const handleOnFocus = () => {
    if (messagesEndRef.current) {
      if (countMessages < 4) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setHeight((countMessages * 15) + 'vh');
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        setHeight((countMessages * 11) + 'vh');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        style={{
          width: '100%',
          height: '20px',
          border: '1px solid #a5a5a5',
          borderRadius: '10px',
          padding: '5px'
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
          }
        }}
        onFocus={handleOnFocus}
      />
      <Button type="submit" width="100%" mt="5px">Send</Button>
    </form>
  );
}

export default MessageForm;
