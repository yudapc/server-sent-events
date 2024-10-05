package types

import (
	"time"

	"github.com/jinzhu/gorm"
	uuid "github.com/satori/go.uuid"
)

type Room struct {
	ID        uuid.UUID  `gorm:"type:char(36);primary_key;" json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"deleted_at"`
	Name      string     `json:"name"`
}

func (room *Room) BeforeCreate(scope *gorm.Scope) error {
	return scope.SetColumn("ID", uuid.NewV4())
}

type RoomUser struct {
	gorm.Model
	RoomID uuid.UUID `gorm:"type:varchar(255);" json:"room_id"`
	UserID int       `json:"user_id"`
}
