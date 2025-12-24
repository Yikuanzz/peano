package tag

import (
	"context"

	tagModel "backend/app/model/tag"
	"backend/app/types/dto"

	"go.uber.org/fx"
	"gorm.io/gorm"
)

type TagRepoParams struct {
	fx.In

	DB *gorm.DB
}

type TagRepo struct {
	db *gorm.DB
}

func NewTagRepo(params TagRepoParams) *TagRepo {
	return &TagRepo{
		db: params.DB,
	}
}

// CreateTag 创建标签
func (r *TagRepo) CreateTag(ctx context.Context, tag *tagModel.Tag) error {
	return r.db.WithContext(ctx).Create(tag).Error
}

// UpdateTag 更新标签
func (r *TagRepo) UpdateTag(ctx context.Context, tagID uint, updates map[string]interface{}) error {
	return r.db.WithContext(ctx).Model(&tagModel.Tag{}).Where("id = ?", tagID).Updates(updates).Error
}

// DeleteTag 删除标签
func (r *TagRepo) DeleteTag(ctx context.Context, tagID uint) error {
	return r.db.WithContext(ctx).Where("id = ?", tagID).Delete(&tagModel.Tag{}).Error
}

// GetTagByID 根据ID获取标签
func (r *TagRepo) GetTagByID(ctx context.Context, tagID uint) (*tagModel.Tag, error) {
	var tag tagModel.Tag
	if err := r.db.WithContext(ctx).Where("id = ?", tagID).First(&tag).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

// GetTagByValue 根据值获取标签
func (r *TagRepo) GetTagByValue(ctx context.Context, tagValue string) (*tagModel.Tag, error) {
	var tag tagModel.Tag
	if err := r.db.WithContext(ctx).Where("tag_value = ?", tagValue).First(&tag).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

// GetTagList 获取标签列表
func (r *TagRepo) GetTagList(ctx context.Context, page, pageSize int) ([]*tagModel.Tag, int64, error) {
	var tags []*tagModel.Tag
	var total int64

	query := r.db.WithContext(ctx).Model(&tagModel.Tag{})

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&tags).Error; err != nil {
		return nil, 0, err
	}

	return tags, total, nil
}

// GetTagListDTO 获取标签列表（DTO格式）
func (r *TagRepo) GetTagListDTO(ctx context.Context, page, pageSize int) ([]dto.TagDTO, int64, error) {
	tags, total, err := r.GetTagList(ctx, page, pageSize)
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

	return tagDTOs, total, nil
}
