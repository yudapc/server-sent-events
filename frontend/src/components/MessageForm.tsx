import { Button, Textarea } from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';

function MessageForm({ token, roomID }: { token: string; roomID: string; }) {
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
      />
      <Button type="submit" width="100%" mt="5px">Send</Button>
    </form>
  );
}

export default MessageForm;
