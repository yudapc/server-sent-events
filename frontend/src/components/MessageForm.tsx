import { Button, Textarea } from '@chakra-ui/react';
import  { useState } from 'react';

function MessageForm({ token, roomID }: { token: string; roomID: string; }) {
  const [content, setContent] = useState('');
  const apiHost = process.env.REACT_APP_API_HOST;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetch(`${apiHost}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, room_id: roomID }),
    }).then(() => setContent(''));
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        style={{
          width: '100%', height: '100px', border: '1px solid #a5a5a5',
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
