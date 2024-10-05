package db

import (
	"fmt"
	"log"
	"os"

	"chat-app-backend/types"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/joho/godotenv"
)

func InitDB() *gorm.DB {
	godotenv.Load()
	// if err != nil {
	// 	log.Fatal("Error loading .env file")
	// }

	dbDriver := os.Getenv("DB_DRIVER")
	dbURL := os.Getenv("DB_URL")

	// DB, err := gorm.Open("sqlite3", "./database.db")
	// dsn := dbURL

	var dsn string
	switch dbDriver {
	case "mysql":
		dsn = fmt.Sprintf("%s?charset=utf8&parseTime=True&loc=Local", dbURL)
	case "sqlite3":
		dsn = dbURL
	default:
		log.Fatalf("Unsupported DB_DRIVER: %s", dbDriver)
	}

	DB, err := gorm.Open(dbDriver, dsn)
	if err != nil {
		log.Fatal(err)
	}

	log.Default().Println("Auto migrating database schema")
	DB.AutoMigrate(&types.Message{}, &types.User{}, &types.Room{}, &types.RoomUser{})

	return DB
}
