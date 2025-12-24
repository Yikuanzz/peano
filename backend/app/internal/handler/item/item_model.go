package item

import (
	"backend/app/types/dto"
	"backend/app/types/meta"
)

type ItemURI struct {
	ItemID uint `uri:"item_id" binding:"required" label:"项目ID" example:"1"`
}

type CreateItemReq struct {
	Content string           `json:"content" binding:"required,min=3,max=1000" label:"内容" example:"这是一个项目"`
	Status  *meta.ItemStatus `json:"status" binding:"omitempty,oneof=normal done marked" label:"状态" example:"normal"`
	Tags    []uint           `json:"tags" binding:"omitempty,min=1,max=10" label:"标签ID" example:"1,2,3"`
}

type UpdateItemReq struct {
	Content *string          `json:"content" binding:"omitempty,min=3,max=1000" label:"内容" example:"这是一个项目"`
	Status  *meta.ItemStatus `json:"status" binding:"omitempty,oneof=normal done marked" label:"状态" example:"normal"`
	Tags    []uint           `json:"tags" binding:"omitempty,min=1,max=10" label:"标签ID" example:"1,2,3"`
}

type GetItemListReq struct {
	DateStart *string          `form:"date_start" binding:"omitempty" label:"开始日期" example:"2025-01-01"`
	DateEnd   *string          `form:"date_end" binding:"omitempty" label:"结束日期" example:"2025-01-02"`
	Status    *meta.ItemStatus `form:"status" binding:"omitempty,oneof=normal done marked" label:"状态" example:"normal"`
	Page      int              `form:"page" binding:"required,min=1" label:"页码"`
	PageSize  int              `form:"page_size" binding:"required,min=1,max=100" label:"每页条数"`
}

type GetItemListResp struct {
	Page       int           `json:"page"`
	PageSize   int           `json:"page_size"`
	Total      int           `json:"total"`
	TotalPages int           `json:"total_pages"`
	Items      []dto.ItemDTO `json:"items"`
}

type GetDailyItemCountReq struct {
	DateStart string `form:"date_start" binding:"required" label:"开始日期" example:"2025-01-01"`
	DateEnd   string `form:"date_end" binding:"required" label:"结束日期" example:"2025-01-02"`
}

type GetDailyItemCountResp struct {
	DailyItemCounts []dto.DailyItemCountDTO `json:"daily_item_counts"`
}
