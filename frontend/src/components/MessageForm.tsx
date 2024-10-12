import { Box } from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';
import { MdSend } from 'react-icons/md';
import TextareaAutosize from 'react-textarea-autosize';

interface MessageFormProps {
  token: string;
  roomID: string;
  messagesEndRef: React.RefObject<HTMLUListElement>;
  countMessages: number;
  setHeight: (height: string) => void;
}

function MessageForm({
  token,
  roomID,
  messagesEndRef,
  countMessages,
  setHeight,
}: MessageFormProps) {
  const [content, setContent] = useState('');
  const apiHost = process.env.REACT_APP_API_HOST;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (content) {
      try {
        await axios.post(
          `${apiHost}/messages`,
          { content, room_id: roomID },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
        setHeight(countMessages * 15 + 'vh');
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        setHeight(countMessages * 11 + 'vh');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Box display="flex" alignItems="stretch" pt="5px">
        <TextareaAutosize
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          style={{
            width: '100%',
            border: '1px solid #a5a5a5',
            borderRadius: '15px',
            padding: '5px',
            resize: 'none',
            fontSize: '0.8rem',
          }}
          minRows={2}
          maxRows={4}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSubmit(e);
            }
          }}
          onFocus={handleOnFocus}
        />
        <IconButton
          type="submit"
          aria-label="Send message"
          icon={<MdSend color="black" />}
          width="40px"
          ml="5px"
          isRound
          colorScheme="green"
        />
      </Box>
    </form>
  );
}

export default MessageForm;
