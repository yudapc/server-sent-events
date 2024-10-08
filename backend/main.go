package main

import (
	"os"
	"strings"

	"chat-app-backend/db"
	"chat-app-backend/handler"
	"chat-app-backend/repository"
	"chat-app-backend/sse"

	"github.com/golang-jwt/jwt"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	db := db.InitDB()

	e := echo.New()
	godotenv.Load()

	allowedOrigins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: allowedOrigins,
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))

	// if err != nil {
	// 	log.Fatal("Error loading .env file")
	// }
	secretKey := os.Getenv("SECRET_KEY")

	// JWT middleware configuration
	config := middleware.JWTConfig{
		Claims:     &jwt.StandardClaims{},
		SigningKey: []byte(secretKey),
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
	rooms.GET("", roomHandler.GetRooms)
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
	events := e.Group("/events")
	events.GET("/:roomid", sse.SSEHandler)

	// Start server
	e.Logger.Fatal(e.Start(":8080"))
}
