package db

import (
	"chat-app-backend/types"
	"log"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

func InitDB() *gorm.DB {
	var err error
	// DB, err := gorm.Open("sqlite3", "./database.db")
	dsn := "dev:dev1122x@tcp(127.0.0.1:3306)/server_sents?charset=utf8mb4&parseTime=True&loc=Local"
	DB, err := gorm.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

	log.Default().Println("Auto migrating database schema")
	DB.AutoMigrate(&types.Message{}, &types.User{}, &types.Room{}, &types.RoomUser{})

	return DB
}
