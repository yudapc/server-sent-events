package handler

import (
	"net/http"
	"time"

	"chat-app-backend/repository"
	"chat-app-backend/serializer"
	"chat-app-backend/types"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	userRepo *repository.UserRepository
}

func NewAuthHandler(userRepo *repository.UserRepository) *AuthHandler {
	return &AuthHandler{userRepo: userRepo}
}

func (h *AuthHandler) Register(c echo.Context) error {
	var user types.User
	if err := c.Bind(&user); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error hashing password"})
	}

	user.Password = string(hashedPassword)

	err = h.userRepo.CreateUser(&user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database execution error"})
	}

	return c.JSON(http.StatusCreated, map[string]string{"message": "User created successfully"})
}

func (h *AuthHandler) Login(c echo.Context) error {
	var user types.User
	if err := c.Bind(&user); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	storedUser, err := h.userRepo.GetUserByUsername(user.Username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database execution error"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(user.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid username or password"})
	}

	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["username"] = storedUser.Username
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	t, err := token.SignedString([]byte("secret"))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error signing token"})
	}

	dataUser := serializer.UserSerializer{
		ID:       storedUser.ID,
		Username: storedUser.Username,
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"token": t, "user": dataUser})
}

func (h *AuthHandler) ForgotPassword(c echo.Context) error {
	// This function should send a password reset link to the user's email address.
	// The implementation depends on the email service you're using.
	return c.JSON(http.StatusNotImplemented, map[string]string{"message": "This function is not implemented yet"})
}
