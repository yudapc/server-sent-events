import { useState, useEffect } from 'react';
import RenderIf from './components/RenderIf';
import Chat from './Chat';

function Room() {
  const [rooms, setRooms] = useState<any>([]);
  const [token, setToken] = useState('');
  const [selectedRoomID, setSelectedRoomID] = useState('');
  const apiHost = process.env.REACT_APP_API_HOST;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${apiHost}/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => setRooms(data.rooms));
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

  return (
    <div>
      <RenderIf isTrue={selectedRoomID === ''}>
        <>
          <h1>Contact <a href="#" onClick={handleLogout}>(logout)</a></h1>
          <ul style={{ listStyleType: 'none', height: 'auto', padding: 0 }}>
            {rooms && rooms.map((room: any) => (
              <li
                key={room.id}
                onClick={() => handleSelectedRoom(room.id)}
                style={{ 
                  cursor: 'pointer',
                  background: '#f5f5f5',
                  padding: '10px',
                  fontSize: '18px',
                  fontWeight: '500',
                  textAlign: 'left',
                  margin: '50px',
                  borderRadius: '10px',
                }}
              >
                <div>
                  {room.username}
                </div>
              </li>
            ))}
          </ul>
        </>
      </RenderIf>
      <RenderIf isTrue={Boolean(selectedRoomID)}>
        <Chat roomID={selectedRoomID} handleBack={handleBack} />
      </RenderIf>
    </div>
  );
}

export default Room;
