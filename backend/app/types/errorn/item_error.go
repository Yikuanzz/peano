package errorn

import (
	"backend/utils/errorx"
)

const (
	// Item 错误码 (4000000-4000099)
	ItemErrNotFound      = int32(4000000) // 项目不存在
	ItemErrCreateFailed  = int32(4000001) // 创建项目失败
	ItemErrUpdateFailed  = int32(4000002) // 更新项目失败
	ItemErrDeleteFailed  = int32(4000003) // 删除项目失败
	ItemErrInvalidStatus = int32(4000004) // 无效的状态
	ItemErrDatabaseError = int32(4000005) // 数据库错误
)

func init() {
	// 注册 Item 错误码
	errorx.RegisterBatch(map[int32]string{
		ItemErrNotFound:      "项目不存在: {item_id}",
		ItemErrCreateFailed:  "创建项目失败: {reason}",
		ItemErrUpdateFailed:  "更新项目失败: {reason}",
		ItemErrDeleteFailed:  "删除项目失败: {reason}",
		ItemErrInvalidStatus: "无效的状态: {status}",
		ItemErrDatabaseError: "数据库错误: {reason}",
	})
}
