package handler

import (
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
	var msg serializer.PayloadCreateChatSerializer
	if err := c.Bind(&msg); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	var payloadMessage types.Message
	payloadMessage.Timestamp = time.Now()
	payloadMessage.Content = msg.Content
	payloadMessage.RoomID = msg.RoomID

	username, err := helper.GetUsernameFromToken(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error getting username from token"})
	}

	user, err := h.userRepo.GetUserByUsername(username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get user"})
	}

	payloadMessage.UserID = int(user.ID)

	_, err = h.chatRepo.CreateMessage(payloadMessage)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed create message"})
	}

	sse.Manager.BroadcastMessage(payloadMessage)

	return c.JSON(http.StatusCreated, msg)
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

	sse.Manager.BroadcastUpdate(msg)

	return c.JSON(http.StatusOK, msg)
}
