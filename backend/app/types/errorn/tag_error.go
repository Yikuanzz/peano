package errorn

import (
	"backend/utils/errorx"
)

const (
	// Tag 错误码 (5000000-5000099)
	TagErrNotFound      = int32(5000000) // 标签不存在
	TagErrCreateFailed  = int32(5000001) // 创建标签失败
	TagErrUpdateFailed  = int32(5000002) // 更新标签失败
	TagErrDeleteFailed  = int32(5000003) // 删除标签失败
	TagErrAlreadyExists = int32(5000004) // 标签已存在
	TagErrDatabaseError = int32(5000005) // 数据库错误
)

func init() {
	// 注册 Tag 错误码
	errorx.RegisterBatch(map[int32]string{
		TagErrNotFound:      "标签不存在: {tag_id}",
		TagErrCreateFailed:  "创建标签失败: {reason}",
		TagErrUpdateFailed:  "更新标签失败: {reason}",
		TagErrDeleteFailed:  "删除标签失败: {reason}",
		TagErrAlreadyExists: "标签已存在: {tag_value}",
		TagErrDatabaseError: "数据库错误: {reason}",
	})
}
