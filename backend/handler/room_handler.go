package handler

import (
	"net/http"

	"chat-app-backend/helper"
	"chat-app-backend/repository"
	"chat-app-backend/serializer"
	"chat-app-backend/types"

	"github.com/labstack/echo/v4"
	uuid "github.com/satori/go.uuid"
)

type RoomHandler struct {
	roomRepo *repository.RoomRepository
	userRepo *repository.UserRepository
	chatRepo *repository.ChatRepository
}

func NewRoomHandler(roomRepo *repository.RoomRepository, userRepo *repository.UserRepository, chatRepo *repository.ChatRepository) *RoomHandler {
	return &RoomHandler{roomRepo: roomRepo, userRepo: userRepo, chatRepo: chatRepo}
}

func (h *RoomHandler) CreateRoom(c echo.Context) error {
	var payload serializer.PayloadCreateRoomSerializer
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	username, err := helper.GetUsernameFromToken(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error getting username from token"})
	}

	user, err := h.userRepo.GetUserByUsername(username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database execution error"})
	}

	userTo, err := h.userRepo.GetUserByUsername(payload.To)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database execution error"})
	}

	// TODO validate when room user with userTo exist with same room

	room := types.Room{
		Name: payload.Name,
	}

	err = h.roomRepo.CreateRoom(&room, int(user.ID), int(userTo.ID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database execution error"})
	}

	return c.JSON(http.StatusCreated, room)
}

func (h *RoomHandler) GetRooms(c echo.Context) error {
	username, err := helper.GetUsernameFromToken(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error getting username from token"})
	}

	user, err := h.userRepo.GetUserByUsername(username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database execution error"})
	}

	rooms, err := h.roomRepo.GetRoomsByUserID(int(user.ID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	dataRooms := make([]serializer.RoomSerializer, 0)
	for _, room := range rooms {
		roomUsers, _ := h.roomRepo.GetRoomUsersByRoomID(room.ID)
		var username string
		for _, roomUser := range roomUsers {
			if roomUser.UserID != int(user.ID) {
				user, _ := h.userRepo.GetUserByID(roomUser.UserID)
				username = user.Username
			}
		}

		dataRooms = append(dataRooms, serializer.RoomSerializer{
			ID:       room.ID,
			Name:     room.Name,
			Username: username,
		})
	}

	response := map[string]interface{}{
		"rooms": dataRooms,
	}

	return c.JSON(http.StatusOK, response)
}

func (h *RoomHandler) GetRoom(c echo.Context) error {
	id := c.Param("id")
	roomID, err := uuid.FromString(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	room, err := h.roomRepo.GetRoomByID(roomID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	roomUsers, err := h.roomRepo.GetRoomUsersByRoomID(roomID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	dataUsers := make([]serializer.UserSerializer, 0)
	for _, roomUser := range roomUsers {
		user, _ := h.userRepo.GetUserByID(roomUser.UserID)
		dataUsers = append(dataUsers, serializer.UserSerializer{
			ID:       user.ID,
			Username: user.Username,
		})
	}

	messages, err := h.chatRepo.GetMessages(roomID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	dataMessages := make([]serializer.MessageSerializer, 0)
	for _, message := range messages {
		user, _ := h.userRepo.GetUserByID(message.UserID)
		dataMessages = append(dataMessages, serializer.MessageSerializer{
			ID:        message.ID,
			Content:   message.Content,
			Timestamp: message.Timestamp,
			UserName:  string(user.Username),
		})
	}

	response := map[string]interface{}{
		"room":     room,
		"users":    dataUsers,
		"messages": dataMessages,
	}

	return c.JSON(http.StatusOK, response)
}

func (h *RoomHandler) UpdateRoom(c echo.Context) error {
	id := c.Param("id")
	roomID, err := uuid.FromString(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	var room types.Room
	if err := c.Bind(&room); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err = h.roomRepo.UpdateRoom(roomID, map[string]interface{}{
		"name": room.Name,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, room)
}

func (h *RoomHandler) DeleteRoom(c echo.Context) error {
	id := c.Param("id")
	roomID, err := uuid.FromString(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err = h.roomRepo.DeleteRoom(roomID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Room deleted successfully"})
}
