package sse

import (
	"fmt"
	"sync"
	"time"

	"chat-app-backend/types"

	"github.com/labstack/echo/v4"
)

type ClientManager struct {
	clients map[chan string]bool
	mutex   sync.Mutex
}

var Manager = ClientManager{
	clients: make(map[chan string]bool),
}

func (m *ClientManager) RegisterClient() chan string {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	ch := make(chan string)
	m.clients[ch] = true
	return ch
}

func (m *ClientManager) UnregisterClient(ch chan string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	if _, ok := m.clients[ch]; ok {
		delete(m.clients, ch)
		close(ch)
	}
}

func (m *ClientManager) BroadcastMessage(msg types.Message) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	message := fmt.Sprintf("event: newMessage\ndata: {\"id\": %d, \"content\": \"%s\", \"timestamp\": \"%s\"}\n\n", msg.ID, msg.Content, msg.Timestamp.Format(time.RFC3339))
	for ch := range m.clients {
		ch <- message
	}
}

func (m *ClientManager) BroadcastUpdate(msg types.Message) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	message := fmt.Sprintf("event: updateMessage\ndata: {\"id\": %d, \"content\": \"%s\", \"timestamp\": \"%s\"}\n\n", msg.ID, msg.Content, msg.Timestamp.Format(time.RFC3339))
	for ch := range m.clients {
		ch <- message
	}
}

func SSEHandler(c echo.Context) error {
	ch := Manager.RegisterClient()
	defer Manager.UnregisterClient(ch)

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
