package main

import (
	"chat-app-backend/db"
	"chat-app-backend/handler"
	"chat-app-backend/repository"
	"chat-app-backend/sse"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	db := db.InitDB()

	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))

	// JWT middleware configuration
	config := middleware.JWTConfig{
		Claims:     &jwt.StandardClaims{},
		SigningKey: []byte("secret"), // replace "secret" with your actual secret key
	}

	// initiate repository
	userRepo := repository.NewUserRepository(db)
	roomRepo := repository.NewRoomRepository(db)
	chatRepo := repository.NewChatRepository(db)

	// initiate handler
	authHandler := handler.NewAuthHandler(userRepo)
	roomHandler := handler.NewRoomHandler(roomRepo, userRepo, chatRepo)
	chatHandler := handler.NewChatHandler(chatRepo, userRepo)

	// Route auth
	e.POST("/register", authHandler.Register)
	e.POST("/login", authHandler.Login)
	e.POST("/forgot-password", authHandler.ForgotPassword)

	// Route rooms
	rooms := e.Group("/rooms")
	rooms.Use(middleware.JWTWithConfig(config))
	rooms.POST("", roomHandler.CreateRoom)
	rooms.GET("/:id", roomHandler.GetRoom)
	rooms.PUT("/:id", roomHandler.UpdateRoom)
	rooms.DELETE("/:id", roomHandler.DeleteRoom)

	// Route messages
	messages := e.Group("/messages")
	messages.Use(middleware.JWTWithConfig(config))
	// messages.GET("", chatHandler.GetMessages)
	messages.POST("", chatHandler.CreateMessage)
	messages.PUT("/:id", chatHandler.UpdateMessage)

	// Route events
	e.GET("/events", sse.SSEHandler)

	// Start server
	e.Logger.Fatal(e.Start(":8080"))
}
