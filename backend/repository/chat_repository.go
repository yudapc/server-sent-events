package repository

import (
	"chat-app-backend/types"

	"github.com/jinzhu/gorm"
	uuid "github.com/satori/go.uuid"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) GetMessages(roomID uuid.UUID) ([]types.Message, error) {
	var messages []types.Message
	err := r.db.Where("room_id = ?", roomID).Order("created_at asc").Find(&messages).Error
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func (r *ChatRepository) CreateMessage(msg types.Message) (int, error) {
	if err := r.db.Create(&msg).Error; err != nil {
		return 0, err
	}

	return int(msg.ID), nil
}

func (r *ChatRepository) UpdateMessage(id string, msg types.Message) error {
	err := r.db.Model(&types.Message{}).Where("id = ?", id).Updates(types.Message{Content: msg.Content, Timestamp: msg.Timestamp}).Error
	return err
}
