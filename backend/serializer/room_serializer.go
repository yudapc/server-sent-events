package serializer

type PayloadCreateRoomSerializer struct {
	Name string `json:"name"`
	To   string `json:"to"`
}
