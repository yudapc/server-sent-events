import { useState, useEffect } from 'react';
import RenderIf from './RenderIf';
import Chat from './Chat';
import { Box, Flex, VStack, Text, Button, FormControl, FormLabel, Input, InputGroup, InputRightAddon } from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import PullToRefresh from 'react-pull-to-refresh';

function Room() {
  const [rooms, setRooms] = useState<any>([]);
  const [token, setToken] = useState('');
  const [selectedRoomID, setSelectedRoomID] = useState('');
  const [isAddRoom, setIsAddRoom] = useState(false);
  const [to, setTo] = useState('');
  const username = localStorage.getItem('username');
  const apiHost = process.env.REACT_APP_API_HOST;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }
  }, []);

  const refetchRooms = async () => {
    const accessToken = await localStorage.getItem('token');
    try {
      const response = await fetch(`${apiHost}/rooms`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRooms(data.rooms);
    } catch (error) {
      console.error('An error occurred while fetching rooms:', error);
    }
  }

  useEffect(() => {
    if (token) {
      refetchRooms();
    }
  }, [token]);

  const handleSelectedRoom = (roomID: string) => {
    setSelectedRoomID(roomID);
  }

  const handleBack = () => {
    setSelectedRoomID('');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();

    fetch(`${apiHost}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: `${username}-${to}`, to }),
    }).then(res => res.json()).then((data) => {
      if (data.error) {
        alert('Create room failed');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      console.log(data);
      setSelectedRoomID(data.id);
      setIsAddRoom(false);
      refetchRooms();
    }).catch(() => {
      alert('Create room failed');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  };

  const handleDeleteRoom = (roomID: string) => {
    fetch(`${apiHost}/rooms/${roomID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json()).then((data) => {
      setRooms(rooms.filter((room: any) => room.id !== roomID));
    }).catch(() => {
      alert('Delete room failed');
    });
  };

  return (
    <PullToRefresh onRefresh={() => refetchRooms()}>
      <VStack width="100%" height="100vh" padding="1" spacing="1" justifyContent="space-between">
        <RenderIf isTrue={selectedRoomID === ''}>
          <Box width="100%">
            <Flex position="sticky" top="0" bg="white" p="2" zIndex="1" alignItems="center" justifyContent="space-between">
              <Button onClick={() => handleLogout()}>Logout</Button>
              <Text fontSize="xl">Contact</Text>
              <IconButton
                aria-label={`${isAddRoom ? 'Cancel' : ''} Add Room`}
                icon={!isAddRoom ? <AddIcon /> : <MinusIcon />}
                onClick={() => setIsAddRoom(!isAddRoom)}
              />
            </Flex>
            <RenderIf isTrue={isAddRoom}>
              <FormControl>
                <FormLabel>To</FormLabel>
                <InputGroup>
                  <Input
                    type='text'
                    placeholder="To"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                  />

                  <InputRightAddon>
                    <IconButton
                      aria-label="Add Room"
                      icon={<AddIcon />}
                      onClick={handleAddRoom}
                    />
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
            </RenderIf>
            <RenderIf isTrue={!isAddRoom}>

              <ul style={{ listStyleType: 'none', height: 'auto', padding: 0 }}>
                {rooms && rooms.map((room: any) => (
                  <li
                    key={room.id}
                    style={{
                      cursor: 'pointer',
                      background: '#f5f5f5',
                      padding: '10px',
                      fontSize: '18px',
                      fontWeight: '500',
                      textAlign: 'left',
                      margin: '5px 10px',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <a href="#" onClick={() => handleSelectedRoom(room.id)} style={{ textDecoration: 'none', display: 'block', width: '80%' }}>{room.username}</a>
                      <a href="#" onClick={() => handleDeleteRoom(room.id)} style={{ textDecoration: 'none' }}>(X)</a>
                    </div>
                  </li>
                ))}
              </ul>

            </RenderIf>
          </Box>
        </RenderIf>

        <RenderIf isTrue={Boolean(selectedRoomID)}>
          <Chat roomID={selectedRoomID} handleBack={handleBack} />
        </RenderIf>
      </VStack>
    </PullToRefresh>
  );
}

export default Room;
