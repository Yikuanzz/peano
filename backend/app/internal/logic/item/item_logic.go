package item

import (
	"context"
	"errors"
	"time"

	itemModel "backend/app/model/item"
	tagModel "backend/app/model/tag"
	"backend/app/types/dto"
	itemError "backend/app/types/errorn"
	tagError "backend/app/types/errorn"
	"backend/app/types/meta"
	"backend/utils/errorx"
	"backend/utils/logs"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

type ItemRepo interface {
	CreateItem(ctx context.Context, item *itemModel.Item) error
	UpdateItem(ctx context.Context, itemID uint, updates map[string]interface{}) error
	DeleteItem(ctx context.Context, itemID uint) error
	GetItemByID(ctx context.Context, itemID uint) (*itemModel.Item, error)
	GetItemListWithTags(ctx context.Context, dateStart *time.Time, dateEnd *time.Time, status *meta.ItemStatus, page, pageSize int) ([]dto.ItemDTO, int64, error)
	GetItemWithTags(ctx context.Context, itemID uint) (*itemModel.Item, []*tagModel.Tag, error)
	SetItemTags(ctx context.Context, itemID uint, tagIDs []uint) error
	GetDailyItemCount(ctx context.Context, dateStart time.Time, dateEnd time.Time) ([]dto.DailyItemCountDTO, error)
}

type ItemTagRepo interface {
	GetTagByID(ctx context.Context, tagID uint) (*tagModel.Tag, error)
}

type ItemLogicParams struct {
	fx.In

	ItemRepo ItemRepo
	TagRepo  ItemTagRepo
}

type ItemLogic struct {
	itemRepo ItemRepo
	tagRepo  ItemTagRepo
}

func NewItemLogic(params ItemLogicParams) *ItemLogic {
	return &ItemLogic{
		itemRepo: params.ItemRepo,
		tagRepo:  params.TagRepo,
	}
}

// CreateItem 创建项目
func (l *ItemLogic) CreateItem(ctx context.Context, content string, status *meta.ItemStatus, tagIDs []uint) (*dto.ItemDTO, error) {
	// 设置默认状态
	itemStatus := string(meta.ItemStatusNormal)
	if status != nil {
		itemStatus = string(*status)
	}

	// 创建项目
	item := &itemModel.Item{
		Content: content,
		Status:  itemStatus,
	}

	if err := l.itemRepo.CreateItem(ctx, item); err != nil {
		logs.CtxErrorf(ctx, "创建项目失败: error=%s", err.Error())
		return nil, errorx.Wrap(err, itemError.ItemErrCreateFailed, errorx.K("reason", err.Error()))
	}

	// 设置标签
	if len(tagIDs) > 0 {
		// 验证标签是否存在
		for _, tagID := range tagIDs {
			_, err := l.tagRepo.GetTagByID(ctx, tagID)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					logs.CtxWarnf(ctx, "标签不存在: tag_id=%d", tagID)
					return nil, errorx.New(tagError.TagErrNotFound, errorx.Kf("tag_id", "%d", tagID))
				}
				logs.CtxErrorf(ctx, "查询标签失败: tag_id=%d, error=%s", tagID, err.Error())
				return nil, errorx.Wrap(err, itemError.ItemErrCreateFailed, errorx.K("reason", err.Error()))
			}
		}

		if err := l.itemRepo.SetItemTags(ctx, item.ID, tagIDs); err != nil {
			logs.CtxErrorf(ctx, "设置项目标签失败: item_id=%d, error=%s", item.ID, err.Error())
			return nil, errorx.Wrap(err, itemError.ItemErrCreateFailed, errorx.K("reason", err.Error()))
		}
	}

	// 获取项目及其标签
	itemModel, tags, err := l.itemRepo.GetItemWithTags(ctx, item.ID)
	if err != nil {
		logs.CtxErrorf(ctx, "获取项目失败: item_id=%d, error=%s", item.ID, err.Error())
		return nil, errorx.Wrap(err, itemError.ItemErrCreateFailed, errorx.K("reason", err.Error()))
	}

	// 构建返回数据
	tagDTOs := make([]dto.TagDTO, 0, len(tags))
	for _, tag := range tags {
		tagDTOs = append(tagDTOs, dto.TagDTO{
			TagID:    tag.ID,
			TagName:  tag.TagName,
			TagValue: tag.TagValue,
			Icon:     tag.Icon,
			Color:    tag.Color,
		})
	}

	return &dto.ItemDTO{
		ItemID:    itemModel.ID,
		CreatedAt: itemModel.CreatedAt,
		UpdatedAt: itemModel.UpdatedAt,
		Content:   itemModel.Content,
		Status:    itemModel.Status,
		Tags:      tagDTOs,
	}, nil
}

// UpdateItem 更新项目
func (l *ItemLogic) UpdateItem(ctx context.Context, itemID uint, content *string, status *meta.ItemStatus, tagIDs []uint) (*dto.ItemDTO, error) {
	// 检查项目是否存在
	_, err := l.itemRepo.GetItemByID(ctx, itemID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxWarnf(ctx, "项目不存在: item_id=%d", itemID)
			return nil, errorx.New(itemError.ItemErrNotFound, errorx.Kf("item_id", "%d", itemID))
		}
		logs.CtxErrorf(ctx, "查询项目失败: item_id=%d, error=%s", itemID, err.Error())
		return nil, errorx.Wrap(err, itemError.ItemErrUpdateFailed, errorx.K("reason", err.Error()))
	}

	// 构建更新字段
	updates := make(map[string]interface{})
	if content != nil {
		updates["content"] = *content
	}
	if status != nil {
		updates["status"] = string(*status)
	}

	// 更新项目
	if len(updates) > 0 {
		if err := l.itemRepo.UpdateItem(ctx, itemID, updates); err != nil {
			logs.CtxErrorf(ctx, "更新项目失败: item_id=%d, error=%s", itemID, err.Error())
			return nil, errorx.Wrap(err, itemError.ItemErrUpdateFailed, errorx.K("reason", err.Error()))
		}
	}

	// 更新标签
	if tagIDs != nil {
		// 验证标签是否存在
		for _, tagID := range tagIDs {
			_, err := l.tagRepo.GetTagByID(ctx, tagID)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					logs.CtxWarnf(ctx, "标签不存在: tag_id=%d", tagID)
					return nil, errorx.New(tagError.TagErrNotFound, errorx.Kf("tag_id", "%d", tagID))
				}
				logs.CtxErrorf(ctx, "查询标签失败: tag_id=%d, error=%s", tagID, err.Error())
				return nil, errorx.Wrap(err, itemError.ItemErrUpdateFailed, errorx.K("reason", err.Error()))
			}
		}

		if err := l.itemRepo.SetItemTags(ctx, itemID, tagIDs); err != nil {
			logs.CtxErrorf(ctx, "设置项目标签失败: item_id=%d, error=%s", itemID, err.Error())
			return nil, errorx.Wrap(err, itemError.ItemErrUpdateFailed, errorx.K("reason", err.Error()))
		}
	}

	// 获取更新后的项目及其标签
	itemModel, tags, err := l.itemRepo.GetItemWithTags(ctx, itemID)
	if err != nil {
		logs.CtxErrorf(ctx, "获取项目失败: item_id=%d, error=%s", itemID, err.Error())
		return nil, errorx.Wrap(err, itemError.ItemErrUpdateFailed, errorx.K("reason", err.Error()))
	}

	// 构建返回数据
	tagDTOs := make([]dto.TagDTO, 0, len(tags))
	for _, tag := range tags {
		tagDTOs = append(tagDTOs, dto.TagDTO{
			TagID:    tag.ID,
			TagName:  tag.TagName,
			TagValue: tag.TagValue,
			Icon:     tag.Icon,
			Color:    tag.Color,
		})
	}

	return &dto.ItemDTO{
		ItemID:    itemModel.ID,
		CreatedAt: itemModel.CreatedAt,
		UpdatedAt: itemModel.UpdatedAt,
		Content:   itemModel.Content,
		Status:    itemModel.Status,
		Tags:      tagDTOs,
	}, nil
}

// DeleteItem 删除项目
func (l *ItemLogic) DeleteItem(ctx context.Context, itemID uint) error {
	// 检查项目是否存在
	_, err := l.itemRepo.GetItemByID(ctx, itemID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxWarnf(ctx, "项目不存在: item_id=%d", itemID)
			return errorx.New(itemError.ItemErrNotFound, errorx.Kf("item_id", "%d", itemID))
		}
		logs.CtxErrorf(ctx, "查询项目失败: item_id=%d, error=%s", itemID, err.Error())
		return errorx.Wrap(err, itemError.ItemErrDeleteFailed, errorx.K("reason", err.Error()))
	}

	// 删除项目
	if err := l.itemRepo.DeleteItem(ctx, itemID); err != nil {
		logs.CtxErrorf(ctx, "删除项目失败: item_id=%d, error=%s", itemID, err.Error())
		return errorx.Wrap(err, itemError.ItemErrDeleteFailed, errorx.K("reason", err.Error()))
	}

	return nil
}

// GetItem 获取项目
func (l *ItemLogic) GetItem(ctx context.Context, itemID uint) (*dto.ItemDTO, error) {
	itemModel, tags, err := l.itemRepo.GetItemWithTags(ctx, itemID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logs.CtxWarnf(ctx, "项目不存在: item_id=%d", itemID)
			return nil, errorx.New(itemError.ItemErrNotFound, errorx.Kf("item_id", "%d", itemID))
		}
		logs.CtxErrorf(ctx, "获取项目失败: item_id=%d, error=%s", itemID, err.Error())
		return nil, errorx.Wrap(err, itemError.ItemErrDatabaseError, errorx.K("reason", err.Error()))
	}

	// 构建返回数据
	tagDTOs := make([]dto.TagDTO, 0, len(tags))
	for _, tag := range tags {
		tagDTOs = append(tagDTOs, dto.TagDTO{
			TagID:    tag.ID,
			TagName:  tag.TagName,
			TagValue: tag.TagValue,
			Icon:     tag.Icon,
			Color:    tag.Color,
		})
	}

	return &dto.ItemDTO{
		ItemID:    itemModel.ID,
		CreatedAt: itemModel.CreatedAt,
		UpdatedAt: itemModel.UpdatedAt,
		Content:   itemModel.Content,
		Status:    itemModel.Status,
		Tags:      tagDTOs,
	}, nil
}

// GetItemList 获取项目列表
func (l *ItemLogic) GetItemList(ctx context.Context, dateStart *time.Time, dateEnd *time.Time, status *meta.ItemStatus, page, pageSize int) ([]dto.ItemDTO, int64, int, error) {
	items, total, err := l.itemRepo.GetItemListWithTags(ctx, dateStart, dateEnd, status, page, pageSize)
	if err != nil {
		logs.CtxErrorf(ctx, "获取项目列表失败: error=%s", err.Error())
		return nil, 0, 0, errorx.Wrap(err, itemError.ItemErrDatabaseError, errorx.K("reason", err.Error()))
	}

	// 计算总页数
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return items, total, totalPages, nil
}

// GetDailyItemCount 获取每日项目数量
func (l *ItemLogic) GetDailyItemCount(ctx context.Context, dateStart time.Time, dateEnd time.Time) ([]dto.DailyItemCountDTO, error) {
	items, err := l.itemRepo.GetDailyItemCount(ctx, dateStart, dateEnd)
	if err != nil {
		logs.CtxErrorf(ctx, "获取每日项目数量失败: error=%s", err.Error())
		return nil, errorx.Wrap(err, itemError.ItemErrDatabaseError, errorx.K("reason", err.Error()))
	}

	return items, nil
}
