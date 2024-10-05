package serializer

import uuid "github.com/satori/go.uuid"

type PayloadCreateRoomSerializer struct {
	Name string `json:"name"`
	To   string `json:"to"`
}

type RoomSerializer struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Username string    `json:"username"`
}
