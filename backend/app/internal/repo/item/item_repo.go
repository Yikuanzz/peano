package item

import (
	"context"
	"time"

	itemModel "backend/app/model/item"
	relationModel "backend/app/model/relation"
	tagModel "backend/app/model/tag"
	"backend/app/types/dto"
	"backend/app/types/meta"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

type ItemRepoParams struct {
	fx.In

	DB *gorm.DB
}

type ItemRepo struct {
	db *gorm.DB
}

func NewItemRepo(params ItemRepoParams) *ItemRepo {
	return &ItemRepo{
		db: params.DB,
	}
}

// CreateItem 创建项目
func (r *ItemRepo) CreateItem(ctx context.Context, item *itemModel.Item) error {
	return r.db.WithContext(ctx).Create(item).Error
}

// UpdateItem 更新项目
func (r *ItemRepo) UpdateItem(ctx context.Context, itemID uint, updates map[string]interface{}) error {
	return r.db.WithContext(ctx).Model(&itemModel.Item{}).Where("id = ?", itemID).Updates(updates).Error
}

// DeleteItem 删除项目
func (r *ItemRepo) DeleteItem(ctx context.Context, itemID uint) error {
	// 开启事务
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 删除项目标签关系
		if err := tx.Where("item_id = ?", itemID).Delete(&relationModel.ItemTag{}).Error; err != nil {
			return err
		}
		// 删除项目
		return tx.Where("id = ?", itemID).Delete(&itemModel.Item{}).Error
	})
}

// GetItemByID 根据ID获取项目
func (r *ItemRepo) GetItemByID(ctx context.Context, itemID uint) (*itemModel.Item, error) {
	var item itemModel.Item
	if err := r.db.WithContext(ctx).Where("id = ?", itemID).First(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

// GetItemList 获取项目列表
func (r *ItemRepo) GetItemList(ctx context.Context, dateStart *time.Time, dateEnd *time.Time, status *meta.ItemStatus, page, pageSize int) ([]*itemModel.Item, int64, error) {
	var items []*itemModel.Item
	var total int64

	query := r.db.WithContext(ctx).Model(&itemModel.Item{})

	// 日期范围过滤
	if dateStart != nil {
		query = query.Where("created_at >= ?", *dateStart)
	}
	if dateEnd != nil {
		query = query.Where("created_at <= ?", *dateEnd)
	}

	// 状态过滤
	if status != nil {
		query = query.Where("status = ?", string(*status))
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

// SetItemTags 设置项目的标签
func (r *ItemRepo) SetItemTags(ctx context.Context, itemID uint, tagIDs []uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 删除旧的标签关系
		if err := tx.Where("item_id = ?", itemID).Delete(&relationModel.ItemTag{}).Error; err != nil {
			return err
		}

		// 创建新的标签关系
		if len(tagIDs) > 0 {
			relations := make([]relationModel.ItemTag, 0, len(tagIDs))
			for _, tagID := range tagIDs {
				relations = append(relations, relationModel.ItemTag{
					ItemID: itemID,
					TagID:  tagID,
				})
			}
			if err := tx.Create(&relations).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// GetItemTags 获取项目的标签
func (r *ItemRepo) GetItemTags(ctx context.Context, itemID uint) ([]*tagModel.Tag, error) {
	var tags []*tagModel.Tag
	err := r.db.WithContext(ctx).
		Table("tag").
		Joins("INNER JOIN item_tag ON tag.id = item_tag.tag_id").
		Where("item_tag.item_id = ?", itemID).
		Find(&tags).Error
	return tags, err
}

// GetItemWithTags 获取项目及其标签
func (r *ItemRepo) GetItemWithTags(ctx context.Context, itemID uint) (*itemModel.Item, []*tagModel.Tag, error) {
	item, err := r.GetItemByID(ctx, itemID)
	if err != nil {
		return nil, nil, err
	}

	tags, err := r.GetItemTags(ctx, itemID)
	if err != nil {
		return nil, nil, err
	}

	return item, tags, nil
}

// GetItemListWithTags 获取项目列表及其标签
func (r *ItemRepo) GetItemListWithTags(ctx context.Context, dateStart *time.Time, dateEnd *time.Time, status *meta.ItemStatus, page, pageSize int) ([]dto.ItemDTO, int64, error) {
	items, total, err := r.GetItemList(ctx, dateStart, dateEnd, status, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	itemDTOs := make([]dto.ItemDTO, 0, len(items))
	for _, item := range items {
		tags, err := r.GetItemTags(ctx, item.ID)
		if err != nil {
			return nil, 0, err
		}

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

		itemDTOs = append(itemDTOs, dto.ItemDTO{
			ItemID:    item.ID,
			CreatedAt: item.CreatedAt,
			UpdatedAt: item.UpdatedAt,
			Content:   item.Content,
			Status:    item.Status,
			Tags:      tagDTOs,
		})
	}

	return itemDTOs, total, nil
}

func (r *ItemRepo) GetDailyItemCount(ctx context.Context, dateStart time.Time, dateEnd time.Time) ([]dto.DailyItemCountDTO, error) {
	// 定义查询结果结构
	var results []struct {
		Date  string `gorm:"column:date"`
		Count int    `gorm:"column:count"`
	}

	// 查询时间范围内每天的 item 创建数量
	// 使用 DATE() 函数提取日期，按日期分组统计
	err := r.db.WithContext(ctx).
		Model(&itemModel.Item{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ? AND created_at < ?", dateStart, dateEnd.AddDate(0, 0, 1)).
		Group("date").
		Order("date").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	// 将查询结果转换为 map，便于查找和补全缺失日期
	countMap := make(map[string]int)
	for _, r := range results {
		countMap[r.Date] = r.Count
	}

	// 补全缺失日期（设为0），确保时间范围内每一天都有数据
	current := dateStart
	end := dateEnd
	for current.Before(end) || current.Equal(end) {
		key := current.Format("2006-01-02")
		if _, exists := countMap[key]; !exists {
			countMap[key] = 0
		}
		current = current.AddDate(0, 0, 1)
	}

	// 转换为 DTO 格式并排序
	dailyItemCounts := make([]dto.DailyItemCountDTO, 0, len(countMap))
	current = dateStart
	end = dateEnd
	for current.Before(end) || current.Equal(end) {
		key := current.Format("2006-01-02")
		// 解析日期字符串为 time.Time
		date, err := time.Parse("2006-01-02", key)
		if err != nil {
			return nil, err
		}
		dailyItemCounts = append(dailyItemCounts, dto.DailyItemCountDTO{
			Date:  date,
			Count: countMap[key],
		})
		current = current.AddDate(0, 0, 1)
	}

	return dailyItemCounts, nil
}
