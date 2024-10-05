package sse

import (
	"fmt"
	"sync"
	"time"

	"chat-app-backend/serializer"

	"github.com/labstack/echo/v4"
)

type ClientManager struct {
	clients map[string]map[chan string]bool
	mutex   sync.Mutex
}

var Manager = ClientManager{
	clients: make(map[string]map[chan string]bool),
}

func (m *ClientManager) RegisterClient(roomID string) chan string {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	ch := make(chan string)
	if _, ok := m.clients[roomID]; !ok {
		m.clients[roomID] = make(map[chan string]bool)
	}
	m.clients[roomID][ch] = true
	return ch
}

func (m *ClientManager) UnregisterClient(roomID string, ch chan string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	if clients, ok := m.clients[roomID]; ok {
		if _, ok := clients[ch]; ok {
			delete(clients, ch)
			close(ch)
		}
	}
}

func (m *ClientManager) BroadcastMessage(msg serializer.MessageSerializer) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	message := fmt.Sprintf("event: newMessage\ndata: {\"id\": %d, \"content\": \"%s\", \"timestamp\": \"%s\", \"room_id\": \"%s\", \"username\": \"%s\"}\n\n", msg.ID, msg.Content, msg.Timestamp.Format(time.RFC3339), msg.RoomID, msg.UserName)
	if clients, ok := m.clients[msg.RoomID.String()]; ok {
		for ch := range clients {
			ch <- message
		}
	}
}

func (m *ClientManager) BroadcastUpdate(msg serializer.MessageSerializer) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	message := fmt.Sprintf("event: updateMessage\ndata: {\"id\": %d, \"content\": \"%s\", \"timestamp\": \"%s\", \"room_id\":\"%s\", \"username\": \"%s\"}\n\n", msg.ID, msg.Content, msg.Timestamp.Format(time.RFC3339), msg.RoomID, msg.UserName)
	if clients, ok := m.clients[msg.RoomID.String()]; ok {
		for ch := range clients {
			ch <- message
		}
	}
}

func SSEHandler(c echo.Context) error {
	roomID := c.Param("roomid")
	ch := Manager.RegisterClient(roomID)
	defer Manager.UnregisterClient(roomID, ch)

	c.Response().Header().Set(echo.HeaderContentType, "text/event-stream")
	c.Response().Header().Set(echo.HeaderCacheControl, "no-cache")
	c.Response().Header().Set(echo.HeaderConnection, "keep-alive")

	for {
		select {
		case msg := <-ch:
			if _, err := fmt.Fprintf(c.Response(), msg); err != nil {
				return err
			}
			c.Response().Flush()
		case <-c.Request().Context().Done():
			return nil
		}
	}
}
