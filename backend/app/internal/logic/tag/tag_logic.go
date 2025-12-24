package tag

import (
	"context"
	"errors"

	tagModel "backend/app/model/tag"
	"backend/app/types/dto"
	tagError "backend/app/types/errorn"
	"backend/utils/errorx"
	"backend/utils/logs"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

type TagRepo interface {
	CreateTag(ctx context.Context, tag *tagModel.Tag) error
	UpdateTag(ctx context.Context, tagID uint, updates map[string]interface{}) error
	DeleteTag(ctx context.Context, tagID uint) error
	GetTagByID(ctx context.Context, tagID uint) (*tagModel.Tag, error)
	GetTagByValue(ctx context.Context, tagValue string) (*tagModel.Tag, error)
	GetTagListDTO(ctx context.Context, page, pageSize int) ([]dto.TagDTO, int64, error)
}

type TagLogicParams struct {
	fx.In

	TagRepo TagRepo
}

type TagLogic struct {
	tagRepo TagRepo
}

func NewTagLogic(params TagLogicParams) *TagLogic {
	return &TagLogic{
		tagRepo: params.TagRepo,
	}
}

// CreateTag 创建标签
func (l *TagLogic) CreateTag(ctx context.Context, tagName string, tagValue string, icon *string, color *string) (*dto.TagDTO, error) {
	// 检查标签值是否已存在
	existingTag, err := l.tagRepo.GetTagByValue(ctx, tagValue)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		logs.CtxErrorf(ctx, "查询标签失败: tag_value=%s, error=%s", tagValue, err.Error())
		return nil, errorx.Wrap(err, tagError.TagErrCreateFailed, errorx.K("reason", err.Error()))
	}
	if existingTag != nil {
		logs.CtxWarnf(ctx, "标签已存在: tag_value=%s", tagValue)
		return nil, errorx.New(tagError.TagErrAlreadyExists, errorx.K("tag_value", tagValue))
	}

	// 设置默认值
	iconValue := ""
	if icon != nil {
		iconValue = *icon
	}
	colorValue := ""
	if color != nil {
		colorValue = *color
	}

	// 创建标签
	tag := &tagModel.Tag{
		TagName:  tagName,
		TagValue: tagValue,
		Icon:     iconValue,
		Color:    colorValue,
	}

	if err := l.tagRepo.CreateTag(ctx, tag); err != nil {
		logs.CtxErrorf(ctx, "创建标签失败: error=%s", err.Error())
		return nil, errorx.Wrap(err, tagError.TagErrCreateFailed, errorx.K("reason", err.Error()))
	}

	return &dto.TagDTO{
		TagID:    tag.ID,
		TagName:  tag.TagName,
		TagValue: tag.TagValue,
		Icon:     tag.Icon,
		Color:    tag.Color,
	}, nil
}

// UpdateTag 更新标签
func (l *TagLogic) UpdateTag(ctx context.Context, tagID uint, tagName *string, tagValue *string, icon *string, color *string) (*dto.TagDTO, error) {
	// 检查标签是否存在
	_, err := l.tagRepo.GetTagByID(ctx, tagID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxWarnf(ctx, "标签不存在: tag_id=%d", tagID)
			return nil, errorx.New(tagError.TagErrNotFound, errorx.Kf("tag_id", "%d", tagID))
		}
		logs.CtxErrorf(ctx, "查询标签失败: tag_id=%d, error=%s", tagID, err.Error())
		return nil, errorx.Wrap(err, tagError.TagErrUpdateFailed, errorx.K("reason", err.Error()))
	}

	// 如果更新 tag_value，检查是否已存在
	if tagValue != nil {
		existingTag, err := l.tagRepo.GetTagByValue(ctx, *tagValue)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxErrorf(ctx, "查询标签失败: tag_value=%s, error=%s", *tagValue, err.Error())
			return nil, errorx.Wrap(err, tagError.TagErrUpdateFailed, errorx.K("reason", err.Error()))
		}
		if existingTag != nil && existingTag.ID != tagID {
			logs.CtxWarnf(ctx, "标签值已存在: tag_value=%s", *tagValue)
			return nil, errorx.New(tagError.TagErrAlreadyExists, errorx.K("tag_value", *tagValue))
		}
	}

	// 构建更新字段
	updates := make(map[string]interface{})
	if tagName != nil {
		updates["tag_name"] = *tagName
	}
	if tagValue != nil {
		updates["tag_value"] = *tagValue
	}
	if icon != nil {
		updates["icon"] = *icon
	}
	if color != nil {
		updates["color"] = *color
	}

	// 如果没有需要更新的字段，直接返回当前标签信息
	if len(updates) == 0 {
		return l.GetTag(ctx, tagID)
	}

	// 更新标签
	if err := l.tagRepo.UpdateTag(ctx, tagID, updates); err != nil {
		logs.CtxErrorf(ctx, "更新标签失败: tag_id=%d, error=%s", tagID, err.Error())
		return nil, errorx.Wrap(err, tagError.TagErrUpdateFailed, errorx.K("reason", err.Error()))
	}

	// 重新查询标签信息
	tag, err := l.tagRepo.GetTagByID(ctx, tagID)
	if err != nil {
		logs.CtxErrorf(ctx, "获取标签失败: tag_id=%d, error=%s", tagID, err.Error())
		return nil, errorx.Wrap(err, tagError.TagErrUpdateFailed, errorx.K("reason", err.Error()))
	}

	return &dto.TagDTO{
		TagID:    tag.ID,
		TagName:  tag.TagName,
		TagValue: tag.TagValue,
		Icon:     tag.Icon,
		Color:    tag.Color,
	}, nil
}

// DeleteTag 删除标签
func (l *TagLogic) DeleteTag(ctx context.Context, tagID uint) error {
	// 检查标签是否存在
	_, err := l.tagRepo.GetTagByID(ctx, tagID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxWarnf(ctx, "标签不存在: tag_id=%d", tagID)
			return errorx.New(tagError.TagErrNotFound, errorx.Kf("tag_id", "%d", tagID))
		}
		logs.CtxErrorf(ctx, "查询标签失败: tag_id=%d, error=%s", tagID, err.Error())
		return errorx.Wrap(err, tagError.TagErrDeleteFailed, errorx.K("reason", err.Error()))
	}

	// 删除标签
	if err := l.tagRepo.DeleteTag(ctx, tagID); err != nil {
		logs.CtxErrorf(ctx, "删除标签失败: tag_id=%d, error=%s", tagID, err.Error())
		return errorx.Wrap(err, tagError.TagErrDeleteFailed, errorx.K("reason", err.Error()))
	}

	return nil
}

// GetTag 获取标签
func (l *TagLogic) GetTag(ctx context.Context, tagID uint) (*dto.TagDTO, error) {
	tag, err := l.tagRepo.GetTagByID(ctx, tagID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxWarnf(ctx, "标签不存在: tag_id=%d", tagID)
			return nil, errorx.New(tagError.TagErrNotFound, errorx.Kf("tag_id", "%d", tagID))
		}
		logs.CtxErrorf(ctx, "获取标签失败: tag_id=%d, error=%s", tagID, err.Error())
		return nil, errorx.Wrap(err, tagError.TagErrDatabaseError, errorx.K("reason", err.Error()))
	}

	return &dto.TagDTO{
		TagID:    tag.ID,
		TagName:  tag.TagName,
		TagValue: tag.TagValue,
		Icon:     tag.Icon,
		Color:    tag.Color,
	}, nil
}

// GetTagList 获取标签列表
func (l *TagLogic) GetTagList(ctx context.Context, page, pageSize int) ([]dto.TagDTO, int64, int, error) {
	tags, total, err := l.tagRepo.GetTagListDTO(ctx, page, pageSize)
	if err != nil {
		logs.CtxErrorf(ctx, "获取标签列表失败: error=%s", err.Error())
		return nil, 0, 0, errorx.Wrap(err, tagError.TagErrDatabaseError, errorx.K("reason", err.Error()))
	}

	// 计算总页数
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return tags, total, totalPages, nil
}
