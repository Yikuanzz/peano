package item

import (
	"context"
	"time"

	"backend/app/types/dto"
	itemError "backend/app/types/errorn"
	"backend/app/types/meta"
	"backend/utils/bind"
	"backend/utils/handle"
	"backend/utils/logs"
	"backend/utils/timex"

	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

type ItemLogic interface {
	CreateItem(ctx context.Context, content string, status *meta.ItemStatus, tagIDs []uint) (*dto.ItemDTO, error)
	UpdateItem(ctx context.Context, itemID uint, content *string, status *meta.ItemStatus, tagIDs []uint) (*dto.ItemDTO, error)
	DeleteItem(ctx context.Context, itemID uint) error
	GetItem(ctx context.Context, itemID uint) (*dto.ItemDTO, error)
	GetItemList(ctx context.Context, dateStart *time.Time, dateEnd *time.Time, status *meta.ItemStatus, page, pageSize int) ([]dto.ItemDTO, int64, int, error)
	GetDailyItemCount(ctx context.Context, dateStart time.Time, dateEnd time.Time) ([]dto.DailyItemCountDTO, error)
}

type ItemHandlerParams struct {
	fx.In

	ItemLogic ItemLogic
}

type ItemHandler struct {
	itemLogic ItemLogic
}

func NewItemHandler(params ItemHandlerParams) *ItemHandler {
	return &ItemHandler{
		itemLogic: params.ItemLogic,
	}
}

var itemBindConfig = bind.FieldErrorConfig{
	InvalidParamCode: itemError.ItemErrDatabaseError,
	RequiredCode:     itemError.ItemErrDatabaseError,
	FieldLabels: map[string]string{
		"item_id":    "项目ID",
		"content":    "内容",
		"status":     "状态",
		"tags":       "标签",
		"date_start": "开始日期",
		"date_end":   "结束日期",
		"page":       "页码",
		"page_size":  "每页条数",
	},
}

// CreateItem 创建项目
// @Summary 创建项目
// @Description 创建一个新项目
// @Tags 项目管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateItemReq true "创建项目请求"
// @Success 200 {object} handle.Response{data=dto.ItemDTO} "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/item [post]
func (h *ItemHandler) CreateItem(c *gin.Context) {
	ctx := c.Request.Context()

	var req CreateItemReq
	if err := bind.ShouldBindJSON(c, &req, itemBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "创建项目", nil)
		return
	}

	result, err := h.itemLogic.CreateItem(ctx, req.Content, req.Status, req.Tags)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "创建项目", nil)
		return
	}

	logs.CtxInfof(ctx, "创建项目成功: item_id=%d", result.ItemID)
	handle.Success(c, result)
}

// UpdateItem 更新项目
// @Summary 更新项目
// @Description 更新指定项目的信息
// @Tags 项目管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param item_id path int true "项目ID"
// @Param request body UpdateItemReq true "更新项目请求"
// @Success 200 {object} handle.Response{data=dto.ItemDTO} "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 404 {object} handle.Response "项目不存在"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/item/{item_id} [put]
func (h *ItemHandler) UpdateItem(c *gin.Context) {
	ctx := c.Request.Context()

	var uri ItemURI
	if err := bind.ShouldBindURI(c, &uri, itemBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "更新项目", nil)
		return
	}

	var req UpdateItemReq
	if err := bind.ShouldBindJSON(c, &req, itemBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "更新项目", nil)
		return
	}

	result, err := h.itemLogic.UpdateItem(ctx, uri.ItemID, req.Content, req.Status, req.Tags)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "更新项目", nil)
		return
	}

	logs.CtxInfof(ctx, "更新项目成功: item_id=%d", result.ItemID)
	handle.Success(c, result)
}

// DeleteItem 删除项目
// @Summary 删除项目
// @Description 删除指定项目
// @Tags 项目管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param item_id path int true "项目ID"
// @Success 200 {object} handle.Response "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 404 {object} handle.Response "项目不存在"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/item/{item_id} [delete]
func (h *ItemHandler) DeleteItem(c *gin.Context) {
	ctx := c.Request.Context()

	var uri ItemURI
	if err := bind.ShouldBindURI(c, &uri, itemBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "删除项目", nil)
		return
	}

	if err := h.itemLogic.DeleteItem(ctx, uri.ItemID); err != nil {
		handle.HandleErrorWithContext(c, err, "删除项目", nil)
		return
	}

	logs.CtxInfof(ctx, "删除项目成功: item_id=%d", uri.ItemID)
	handle.Success(c, nil)
}

// GetItem 获取项目
// @Summary 获取项目
// @Description 获取指定项目的详细信息
// @Tags 项目管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param item_id path int true "项目ID"
// @Success 200 {object} handle.Response{data=dto.ItemDTO} "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 404 {object} handle.Response "项目不存在"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/item/{item_id} [get]
func (h *ItemHandler) GetItem(c *gin.Context) {
	ctx := c.Request.Context()

	var uri ItemURI
	if err := bind.ShouldBindURI(c, &uri, itemBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "获取项目", nil)
		return
	}

	result, err := h.itemLogic.GetItem(ctx, uri.ItemID)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "获取项目", nil)
		return
	}

	logs.CtxInfof(ctx, "获取项目成功: item_id=%d", result.ItemID)
	handle.Success(c, result)
}

// GetItemList 获取项目列表
// @Summary 获取项目列表
// @Description 获取项目列表，支持分页和筛选
// @Tags 项目管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param date_start query string false "开始日期"
// @Param date_end query string false "结束日期"
// @Param status query string false "状态"
// @Param page query int false "页码"
// @Param page_size query int false "每页条数"
// @Success 200 {object} handle.Response{data=GetItemListResp} "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/item/list [get]
func (h *ItemHandler) GetItemList(c *gin.Context) {
	ctx := c.Request.Context()

	var req GetItemListReq
	if err := bind.ShouldBindQuery(c, &req, itemBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "获取项目列表", nil)
		return
	}

	// 解析时间字符串
	var dateStart *time.Time
	if req.DateStart != nil && *req.DateStart != "" {
		parsed, err := timex.ParseDateString(*req.DateStart)
		if err != nil {
			handle.HandleErrorWithContext(c, err, "获取项目列表", nil)
			return
		}
		dateStart = &parsed
	}

	var dateEnd *time.Time
	if req.DateEnd != nil && *req.DateEnd != "" {
		parsed, err := timex.ParseDateString(*req.DateEnd)
		if err != nil {
			handle.HandleErrorWithContext(c, err, "获取项目列表", nil)
			return
		}
		dateEnd = &parsed
	}

	items, total, totalPages, err := h.itemLogic.GetItemList(ctx, dateStart, dateEnd, req.Status, req.Page, req.PageSize)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "获取项目列表", nil)
		return
	}

	logs.CtxInfof(ctx, "获取项目列表成功: page=%d, page_size=%d, total=%d", req.Page, req.PageSize, total)
	handle.Success(c, GetItemListResp{
		Page:       req.Page,
		PageSize:   req.PageSize,
		Total:      int(total),
		TotalPages: totalPages,
		Items:      items,
	})
}

// GetDailyItemCount 获取每日项目数量
// @Summary 获取每日项目数量
// @Description 获取每日项目数量
// @Tags 项目管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param date_start query string true "开始日期"
// @Param date_end query string true "结束日期"
// @Success 200 {object} handle.Response{data=GetDailyItemCountResp} "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/item/daily-count [get]
func (h *ItemHandler) GetDailyItemCount(c *gin.Context) {
	ctx := c.Request.Context()

	var req GetDailyItemCountReq
	if err := bind.ShouldBindQuery(c, &req, itemBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "获取每日项目数量", nil)
		return
	}

	// 解析时间字符串
	dateStart, err := timex.ParseDateString(req.DateStart)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "获取每日项目数量", nil)
		return
	}

	dateEnd, err := timex.ParseDateString(req.DateEnd)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "获取每日项目数量", nil)
		return
	}

	dailyItemCounts, err := h.itemLogic.GetDailyItemCount(ctx, dateStart, dateEnd)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "获取每日项目数量", nil)
		return
	}

	logs.CtxInfof(ctx, "获取每日项目数量成功: date_start=%s, date_end=%s", req.DateStart, req.DateEnd)
	handle.Success(c, GetDailyItemCountResp{
		DailyItemCounts: dailyItemCounts,
	})
}
