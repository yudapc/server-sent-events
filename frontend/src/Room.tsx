import { useState, useEffect } from 'react';
import RenderIf from './components/RenderIf';
import Chat from './Chat';

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
      console.log(data);
      setSelectedRoomID(data.id);
    }).catch(() => {
      alert('Create room failed');
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
    <div>
      <RenderIf isTrue={selectedRoomID === ''}>
        <>
          <h1>Contact <a href="#" onClick={handleLogout}>(logout)</a></h1>
          <button onClick={() => setIsAddRoom(!isAddRoom)}>{isAddRoom ? 'Cancel' : ''} Add Room</button>
          <RenderIf isTrue={isAddRoom}>
            <form onSubmit={handleAddRoom}>
              <input
                type="text"
                placeholder="To"
                value={to}
                onChange={e => setTo(e.target.value)}
              />
              <button type="submit">Create</button>
            </form>
          </RenderIf>
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
                  margin: '5px 50px',
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
        </>
      </RenderIf>

      <RenderIf isTrue={Boolean(selectedRoomID)}>
        <Chat roomID={selectedRoomID} handleBack={handleBack} />
      </RenderIf>
    </div>
  );
}

export default Room;
