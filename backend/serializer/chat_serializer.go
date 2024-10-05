package serializer

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

type PayloadCreateChatSerializer struct {
	Content string    `json:"content"`
	RoomID  uuid.UUID `json:"room_id"`
}

type MessageSerializer struct {
	ID        uint      `json:"id"`
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
	RoomID    uuid.UUID `json:"room_id"`
	UserName  string    `json:"username"`
}
