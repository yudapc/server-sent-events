package repository

import (
	"log"

	"chat-app-backend/types"

	"github.com/jinzhu/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) getUser(condition interface{}, args ...interface{}) (types.User, error) {
	var user types.User
	err := r.db.Where(condition, args...).First(&user).Error
	if err != nil {
		log.Printf("Unable to get user: %v", err)
		return types.User{}, err
	}
	return user, nil
}

func (r *UserRepository) GetUserByID(id int, status ...bool) (types.User, error) {
	if len(status) > 0 && !status[0] {
		return r.getUser("id = ? AND status = ?", id, status[0])
	} else {
		return r.getUser("id = ?", id)
	}
}

func (r *UserRepository) GetUserByUsername(username string, status ...bool) (types.User, error) {
	if len(status) > 0 && !status[0] {
		return r.getUser("username = ? AND status = ?", username, status[0])
	} else {
		return r.getUser("username = ?", username)
	}
}

func (r *UserRepository) GetUsers(filters map[string]interface{}) ([]types.User, error) {
	var users []types.User
	err := r.db.Where(filters).Find(&users).Error
	if err != nil {
		log.Printf("Unable to get users: %v", err)
		return nil, err
	}
	return users, nil
}

func (r *UserRepository) CreateUser(user *types.User) error {
	err := r.db.Create(user).Error
	if err != nil {
		log.Printf("Unable to create user: %v", err)
		return err
	}
	return nil
}

func (r *UserRepository) UpdateUser(id int, updates map[string]interface{}) error {
	err := r.db.Model(&types.User{}).Where("id = ?", id).Updates(updates).Error
	if err != nil {
		log.Printf("Unable to update user with ID %d: %v", id, err)
		return err
	}
	return nil
}

func (r *UserRepository) DeleteUser(id int) error {
	err := r.db.Model(&types.User{}).Where("id = ?", id).Update("deleted_at", gorm.Expr("CURRENT_TIMESTAMP")).Error
	if err != nil {
		log.Printf("Unable to soft delete user with ID %d: %v", id, err)
		return err
	}
	return nil
}
