import { AddIcon, DeleteIcon, MinusIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
  VStack,
} from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

import Chat from './Chat';
import RenderIf from './RenderIf';

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
      const response = await axios.get(`${apiHost}/rooms`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setRooms(response.data.rooms);
    } catch (error) {
      console.error('An error occurred while fetching rooms:', error);
    }
  };

  useEffect(() => {
    if (token) {
      refetchRooms();
    }
  }, [token]);

  const handleSelectedRoom = (roomID: string) => {
    setSelectedRoomID(roomID);
  };

  const handleBack = () => {
    setSelectedRoomID('');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${apiHost}/rooms`,
        { name: `${username}-${to}`, to },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.error) {
        alert('Create room failed');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.log(response.data);
        setSelectedRoomID(response.data.id);
        setIsAddRoom(false);
        refetchRooms();
      }
    } catch (error) {
      alert('Create room failed');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleDeleteRoom = async (roomID: string) => {
    try {
      await axios.delete(`${apiHost}/rooms/${roomID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRooms(rooms.filter((room: any) => room.id !== roomID));
    } catch (error) {
      alert('Delete room failed');
    }
  };

  return (
    <VStack width="100%" height="100vh" justifyContent="space-between">
      <RenderIf isTrue={selectedRoomID === ''}>
        <Box width="100%">
          <Flex
            position="sticky"
            top="0"
            bg="#f4f4f4"
            p="2"
            zIndex="1"
            alignItems="center"
            justifyContent="space-between"
            mt="-25px"
            mb="35px"
          >
            <Button onClick={() => handleLogout()}>Logout</Button>
            <Text fontSize="xl">Contact</Text>
            <IconButton
              aria-label={`${isAddRoom ? 'Cancel' : ''} Add Room`}
              icon={!isAddRoom ? <AddIcon /> : <MinusIcon />}
              onClick={() => setIsAddRoom(!isAddRoom)}
            />
          </Flex>
          <RenderIf isTrue={isAddRoom}>
            <FormControl p="10px">
              <FormLabel>To</FormLabel>
              <InputGroup>
                <Input
                  type="text"
                  placeholder="Input username"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />

                <InputRightAddon>
                  <IconButton aria-label="Add Room" icon={<AddIcon />} onClick={handleAddRoom} />
                </InputRightAddon>
              </InputGroup>
            </FormControl>
          </RenderIf>
          <RenderIf isTrue={!isAddRoom}>
            <ul style={{ listStyleType: 'none', height: 'auto', padding: 0 }}>
              {rooms &&
                rooms.map((room: any) => (
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
                      <a
                        href="#"
                        onClick={() => handleSelectedRoom(room.id)}
                        style={{ textDecoration: 'none', display: 'block', width: '80%' }}
                      >
                        {room.username}
                      </a>
                      <IconButton
                        aria-label="Delete room"
                        icon={<DeleteIcon />}
                        onClick={() => handleDeleteRoom(room.id)}
                        w="10px"
                      />
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
  );
}

export default Room;
