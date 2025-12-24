package relation

var ItemTagTableName = "item_tag"

// ItemTag 项目标签关系
type ItemTag struct {
	ID     uint `gorm:"column:id;type:uint;primarykey;comment:关系ID"`
	ItemID uint `gorm:"column:item_id;type:uint;not null;comment:项目ID"`
	TagID  uint `gorm:"column:tag_id;type:uint;not null;comment:标签ID"`
}

func (ItemTag) TableName() string {
	return ItemTagTableName
}
