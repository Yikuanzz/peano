package dto

type TagDTO struct {
	TagID    uint   `json:"tag_id"`
	TagName  string `json:"tag_name"`
	TagValue string `json:"tag_value"`
	Icon     string `json:"icon"`
	Color    string `json:"color"`
}
