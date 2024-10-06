import React, { useState } from 'react';

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
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        style={{ width: '90%', height: '100px' }}
      />
      <button type="submit" style={{ height: '105px', marginLeft: '5px' }}>Send</button>
    </form>
  );
}

export default MessageForm;
