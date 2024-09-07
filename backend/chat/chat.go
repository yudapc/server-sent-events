package chat

import (
	"net/http"
	"time"

	"chat-app-backend/db"
	"chat-app-backend/sse"
	"chat-app-backend/types"

	"github.com/labstack/echo/v4"
)

func GetMessages(c echo.Context) error {
	rows, err := db.DB.Query("SELECT id, content, timestamp FROM messages ORDER BY timestamp ASC")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	messages := []types.Message{}
	for rows.Next() {
		var msg types.Message
		if err := rows.Scan(&msg.ID, &msg.Content, &msg.Timestamp); err != nil {
			return c.JSON(http.StatusInternalServerError, err.Error())
		}
		messages = append(messages, msg)
	}

	return c.JSON(http.StatusOK, messages)
}

func CreateMessage(c echo.Context) error {
	var msg types.Message
	if err := c.Bind(&msg); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	msg.Timestamp = time.Now()

	result, err := db.DB.Exec("INSERT INTO messages (content, timestamp) VALUES (?, ?)", msg.Content, msg.Timestamp)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database execution error"})
	}

	id, err := result.LastInsertId()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get last insert ID"})
	}
	msg.ID = int(id)

	sse.Manager.BroadcastMessage(msg)

	return c.JSON(http.StatusCreated, msg)
}

func UpdateMessage(c echo.Context) error {
	id := c.Param("id")
	var msg types.Message
	if err := c.Bind(&msg); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	_, err := db.DB.Exec("UPDATE messages SET content = ?, timestamp = ? WHERE id = ?", msg.Content, time.Now(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	sse.Manager.BroadcastUpdate(msg)

	return c.JSON(http.StatusOK, msg)
}
