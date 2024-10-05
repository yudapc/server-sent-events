package serializer

type UserSerializer struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
}
