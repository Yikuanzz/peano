package meta

// ContextKey 上下文键
type ContextKey string

const (
	ContextKeyAccessToken ContextKey = "access_token"
	ContextKeyUserID      ContextKey = "user_id"
)

// ItemStatus 项目状态
type ItemStatus string

const (
	ItemStatusNormal ItemStatus = "normal"
	ItemStatusDone   ItemStatus = "done"
	ItemStatusMarked ItemStatus = "marked"
)
