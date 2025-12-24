package tag

import "backend/app/types/dto"

type TagURI struct {
	TagID uint `uri:"tag_id" binding:"required" label:"标签ID" example:"1"`
}

type CreateTagReq struct {
	TagName  string  `json:"tag_name" binding:"required,min=1,max=12" label:"标签名" example:"工作"`
	TagValue string  `json:"tag_value" binding:"required,min=1,max=32" label:"标签值" example:"work"`
	Icon     *string `json:"icon" binding:"omitempty,min=3,max=255" label:"图标"`
	Color    *string `json:"color" binding:"omitempty,min=3,max=12" label:"颜色"`
}

type UpdateTagReq struct {
	TagName  *string `json:"tag_name" binding:"omitempty,min=1,max=12" label:"标签名"`
	TagValue *string `json:"tag_value" binding:"omitempty,min=1,max=32" label:"标签值"`
	Icon     *string `json:"icon" binding:"omitempty,min=3,max=255" label:"图标"`
	Color    *string `json:"color" binding:"omitempty,min=3,max=12" label:"颜色"`
}

type GetTagListReq struct {
	Page     int `form:"page" binding:"required,min=1" label:"页码"`
	PageSize int `form:"page_size" binding:"required,min=1,max=100" label:"每页条数"`
}

type GetTagListResp struct {
	Page       int          `json:"page"`
	PageSize   int          `json:"page_size"`
	Total      int          `json:"total"`
	TotalPages int          `json:"total_pages"`
	Tags       []dto.TagDTO `json:"tags"`
}
