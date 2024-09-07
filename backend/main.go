package main

import (
	"chat-app-backend/chat"
	"chat-app-backend/db"
	"chat-app-backend/sse"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	db.InitDB()

	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))

	// Routes
	e.GET("/messages", chat.GetMessages)
	e.POST("/messages", chat.CreateMessage)
	e.PUT("/messages/:id", chat.UpdateMessage)

	e.GET("/events", sse.SSEHandler)

	// Start server
	e.Logger.Fatal(e.Start(":8080"))
}
