package dto

import "time"

type ItemDTO struct {
	ItemID    uint      `json:"item_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Content   string    `json:"content"`
	Status    string    `json:"status"`
	Tags      []TagDTO  `json:"tags"`
}

type DailyItemCountDTO struct {
	Date  time.Time `json:"date"`
	Count int       `json:"count"`
}
