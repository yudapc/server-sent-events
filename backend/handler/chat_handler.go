package handler

import (
	"fmt"
	"net/http"
	"time"

	"chat-app-backend/helper"
	"chat-app-backend/repository"
	"chat-app-backend/serializer"
	"chat-app-backend/sse"
	"chat-app-backend/types"

	"github.com/labstack/echo/v4"
)

type ChatHandler struct {
	chatRepo *repository.ChatRepository
	userRepo *repository.UserRepository
}

func NewChatHandler(chatRepo *repository.ChatRepository, userRepo *repository.UserRepository) *ChatHandler {
	return &ChatHandler{chatRepo: chatRepo, userRepo: userRepo}
}

// func (h *ChatHandler) GetMessages(c echo.Context) error {
// 	messages, err := h.chatRepo.GetMessages()
// 	if err != nil {
// 		return c.JSON(http.StatusInternalServerError, err.Error())
// 	}

// 	return c.JSON(http.StatusOK, messages)
// }

func (h *ChatHandler) CreateMessage(c echo.Context) error {
	var payload serializer.PayloadCreateChatSerializer
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	var dataMessage types.Message
	dataMessage.Timestamp = time.Now()
	dataMessage.Content = payload.Content
	dataMessage.RoomID = payload.RoomID

	fmt.Println(dataMessage)

	username, err := helper.GetUsernameFromToken(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error getting username from token"})
	}

	user, err := h.userRepo.GetUserByUsername(username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get user"})
	}

	dataMessage.UserID = int(user.ID)

	_, err = h.chatRepo.CreateMessage(dataMessage)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed create message"})
	}

	dataMessageBroadcast := serializer.MessageSerializer{
		ID:        dataMessage.ID,
		Content:   dataMessage.Content,
		Timestamp: dataMessage.Timestamp,
		UserName:  username,
		RoomID:    dataMessage.RoomID,
	}
	sse.Manager.BroadcastMessage(dataMessageBroadcast)

	return c.JSON(http.StatusCreated, payload)
}

func (h *ChatHandler) UpdateMessage(c echo.Context) error {
	id := c.Param("id")
	var msg types.Message
	if err := c.Bind(&msg); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	err := h.chatRepo.UpdateMessage(id, msg)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	username, err := helper.GetUsernameFromToken(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error getting username from token"})
	}

	dataMessageBroadcast := serializer.MessageSerializer{
		ID:        msg.ID,
		Content:   msg.Content,
		Timestamp: msg.Timestamp,
		UserName:  username,
		RoomID:    msg.RoomID,
	}
	sse.Manager.BroadcastUpdate(dataMessageBroadcast)

	return c.JSON(http.StatusOK, msg)
}
