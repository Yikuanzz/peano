package tag

import (
	"context"

	"backend/app/types/dto"
	tagError "backend/app/types/errorn"
	"backend/utils/bind"
	"backend/utils/handle"
	"backend/utils/logs"

	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

type TagLogic interface {
	CreateTag(ctx context.Context, tagName string, tagValue string, icon *string, color *string) (*dto.TagDTO, error)
	UpdateTag(ctx context.Context, tagID uint, tagName *string, tagValue *string, icon *string, color *string) (*dto.TagDTO, error)
	DeleteTag(ctx context.Context, tagID uint) error
	GetTag(ctx context.Context, tagID uint) (*dto.TagDTO, error)
	GetTagList(ctx context.Context, page, pageSize int) ([]dto.TagDTO, int64, int, error)
}

type TagHandlerParams struct {
	fx.In

	TagLogic TagLogic
}

type TagHandler struct {
	tagLogic TagLogic
}

func NewTagHandler(params TagHandlerParams) *TagHandler {
	return &TagHandler{
		tagLogic: params.TagLogic,
	}
}

var tagBindConfig = bind.FieldErrorConfig{
	InvalidParamCode: tagError.TagErrDatabaseError,
	RequiredCode:     tagError.TagErrDatabaseError,
	FieldLabels: map[string]string{
		"tag_id":    "标签ID",
		"tag_name":  "标签名",
		"tag_value": "标签值",
		"icon":      "图标",
		"color":     "颜色",
		"page":      "页码",
		"page_size": "每页条数",
	},
}

// CreateTag 创建标签
// @Summary 创建标签
// @Description 创建一个新标签
// @Tags 标签管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateTagReq true "创建标签请求"
// @Success 200 {object} handle.Response{data=dto.TagDTO} "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/tag [post]
func (h *TagHandler) CreateTag(c *gin.Context) {
	ctx := c.Request.Context()

	var req CreateTagReq
	if err := bind.ShouldBindJSON(c, &req, tagBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "创建标签", nil)
		return
	}

	result, err := h.tagLogic.CreateTag(ctx, req.TagName, req.TagValue, req.Icon, req.Color)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "创建标签", nil)
		return
	}

	logs.CtxInfof(ctx, "创建标签成功: tag_id=%d", result.TagID)
	handle.Success(c, result)
}

// UpdateTag 更新标签
// @Summary 更新标签
// @Description 更新指定标签的信息
// @Tags 标签管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tag_id path int true "标签ID"
// @Param request body UpdateTagReq true "更新标签请求"
// @Success 200 {object} handle.Response{data=dto.TagDTO} "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 404 {object} handle.Response "标签不存在"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/tag/{tag_id} [put]
func (h *TagHandler) UpdateTag(c *gin.Context) {
	ctx := c.Request.Context()

	var uri TagURI
	if err := bind.ShouldBindURI(c, &uri, tagBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "更新标签", nil)
		return
	}

	var req UpdateTagReq
	if err := bind.ShouldBindQuery(c, &req, tagBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "更新标签", nil)
		return
	}

	result, err := h.tagLogic.UpdateTag(ctx, uri.TagID, req.TagName, req.TagValue, req.Icon, req.Color)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "更新标签", nil)
		return
	}

	logs.CtxInfof(ctx, "更新标签成功: tag_id=%d", result.TagID)
	handle.Success(c, result)
}

// DeleteTag 删除标签
// @Summary 删除标签
// @Description 删除指定标签
// @Tags 标签管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tag_id path int true "标签ID"
// @Success 200 {object} handle.Response "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 404 {object} handle.Response "标签不存在"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/tag/{tag_id} [delete]
func (h *TagHandler) DeleteTag(c *gin.Context) {
	ctx := c.Request.Context()

	var uri TagURI
	if err := bind.ShouldBindURI(c, &uri, tagBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "删除标签", nil)
		return
	}

	if err := h.tagLogic.DeleteTag(ctx, uri.TagID); err != nil {
		handle.HandleErrorWithContext(c, err, "删除标签", nil)
		return
	}

	logs.CtxInfof(ctx, "删除标签成功: tag_id=%d", uri.TagID)
	handle.Success(c, nil)
}

// GetTag 获取标签
// @Summary 获取标签
// @Description 获取指定标签的详细信息
// @Tags 标签管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param tag_id path int true "标签ID"
// @Success 200 {object} handle.Response{data=dto.TagDTO} "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 404 {object} handle.Response "标签不存在"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/tag/{tag_id} [get]
func (h *TagHandler) GetTag(c *gin.Context) {
	ctx := c.Request.Context()

	var uri TagURI
	if err := bind.ShouldBindURI(c, &uri, tagBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "获取标签", nil)
		return
	}

	result, err := h.tagLogic.GetTag(ctx, uri.TagID)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "获取标签", nil)
		return
	}

	logs.CtxInfof(ctx, "获取标签成功: tag_id=%d", result.TagID)
	handle.Success(c, result)
}

// GetTagList 获取标签列表
// @Summary 获取标签列表
// @Description 获取标签列表，支持分页
// @Tags 标签管理
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "页码"
// @Param page_size query int false "每页条数"
// @Success 200 {object} handle.Response{data=GetTagListResp} "成功"
// @Failure 400 {object} handle.Response "请求参数错误"
// @Failure 500 {object} handle.Response "服务器内部错误"
// @Router /api/tag/list [get]
func (h *TagHandler) GetTagList(c *gin.Context) {
	ctx := c.Request.Context()

	var req GetTagListReq
	if err := bind.ShouldBindQuery(c, &req, tagBindConfig); err != nil {
		handle.HandleErrorWithContext(c, err, "获取标签列表", nil)
		return
	}

	tags, total, totalPages, err := h.tagLogic.GetTagList(ctx, req.Page, req.PageSize)
	if err != nil {
		handle.HandleErrorWithContext(c, err, "获取标签列表", nil)
		return
	}

	logs.CtxInfof(ctx, "获取标签列表成功: page=%d, page_size=%d, total=%d", req.Page, req.PageSize, total)
	handle.Success(c, GetTagListResp{
		Page:       req.Page,
		PageSize:   req.PageSize,
		Total:      int(total),
		TotalPages: totalPages,
		Tags:       tags,
	})
}
