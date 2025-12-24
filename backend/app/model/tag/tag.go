package tag

import "gorm.io/datatypes"

var TagTableName = "tag"

type Tag struct {
	ID        uint           `gorm:"column:id;type:uint;primarykey;comment:标签ID"`
	TagName   string         `gorm:"column:tag_name;type:varchar(12);not null;comment:标签名"`
	TagValue  string         `gorm:"column:tag_value;type:varchar(32);not null;comment:标签值"`
	Icon      string         `gorm:"column:icon;type:varchar(255);not null;comment:图标"`
	Color     string         `gorm:"column:color;type:varchar(12);not null;comment:颜色"`
	ExtraData datatypes.JSON `gorm:"column:extra_data;type:json;comment:扩展数据"`
}

func (Tag) TableName() string {
	return TagTableName
}
