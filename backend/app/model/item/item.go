package item

import (
	"time"
)

var ItemTableName = "item"

type Item struct {
	ID        uint      `gorm:"column:id;type:uint;primarykey;comment:项目ID"`
	CreatedAt time.Time `gorm:"column:created_at;type:datetime;default:current_timestamp;not null;index:idx_item_created_at;comment:创建时间"`
	UpdatedAt time.Time `gorm:"column:updated_at;type:datetime;default:current_timestamp;on update:current_timestamp;not null;comment:更新时间"`
	Content   string    `gorm:"column:content;type:text;not null;comment:内容"`
	Status    string    `gorm:"column:status;type:varchar(12);not null;comment:状态"`
}

func (Item) TableName() string {
	return ItemTableName
}
