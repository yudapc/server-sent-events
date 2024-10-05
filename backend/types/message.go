package types

import (
	"time"

	"github.com/jinzhu/gorm"
	uuid "github.com/satori/go.uuid"
)

type Message struct {
	gorm.Model
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
	RoomID    uuid.UUID `gorm:"type:char(36); json:"room_id"`
	UserID    int       `json:"user_id"`
}
