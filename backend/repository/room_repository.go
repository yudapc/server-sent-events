package repository

import (
	"log"

	"chat-app-backend/types"

	"github.com/jinzhu/gorm"
	uuid "github.com/satori/go.uuid"
)

type RoomRepository struct {
	db *gorm.DB
}

func NewRoomRepository(db *gorm.DB) *RoomRepository {
	return &RoomRepository{db: db}
}

func (r *RoomRepository) CreateRoomOnly(room *types.Room) error {
	err := r.db.Create(room).Error
	if err != nil {
		log.Printf("Unable to create room: %v", err)
		return err
	}
	return nil
}

func (r *RoomRepository) CreateRoom(room *types.Room, userID int) error {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(room).Error; err != nil {
			return err
		}

		roomUser := &types.RoomUser{
			RoomID: room.ID,
			UserID: userID,
		}

		if err := tx.Create(roomUser).Error; err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		log.Printf("Unable to create room and add user to it: %v", err)
		return err
	}

	return nil
}

func (r *RoomRepository) GetRoomByID(id uuid.UUID) (types.Room, error) {
	var room types.Room
	err := r.db.Where("id = ?", id).First(&room).Error
	if err != nil {
		log.Printf("Unable to get room: %v", err)
		return types.Room{}, err
	}
	return room, nil
}

func (r *RoomRepository) GetRoomUsersByRoomID(id uuid.UUID) ([]types.RoomUser, error) {
	var roomUsers []types.RoomUser
	err := r.db.Where("room_id = ?", id).Find(&roomUsers).Error
	if err != nil {
		log.Printf("Unable to get room users: %v", err)
		return nil, err
	}

	return roomUsers, nil
}

func (r *RoomRepository) UpdateRoom(id uuid.UUID, updates map[string]interface{}) error {
	err := r.db.Model(&types.Room{}).Where("id = ?", id).Updates(updates).Error
	if err != nil {
		log.Printf("Unable to update room with ID %s: %v", id, err)
		return err
	}
	return nil
}

func (r *RoomRepository) DeleteRoom(id uuid.UUID) error {
	err := r.db.Delete(&types.Room{}, id).Error
	if err != nil {
		log.Printf("Unable to delete room with ID %s: %v", id, err)
		return err
	}
	return nil
}

func (r *RoomRepository) AddUserToRoom(roomUser *types.RoomUser) error {
	err := r.db.Create(roomUser).Error
	if err != nil {
		log.Printf("Unable to add user to room: %v", err)
		return err
	}
	return nil
}

func (r *RoomRepository) RemoveUserFromRoom(roomID uuid.UUID, userID int) error {
	err := r.db.Delete(&types.RoomUser{}, "room_id = ? AND user_id = ?", roomID, userID).Error
	if err != nil {
		log.Printf("Unable to remove user from room: %v", err)
		return err
	}
	return nil
}
