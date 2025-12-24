package handler

import (
	fileHandler "backend/app/internal/handler/file"
	itemHandler "backend/app/internal/handler/item"
	tagHandler "backend/app/internal/handler/tag"
	userHandler "backend/app/internal/handler/user"

	"go.uber.org/fx"
)

// HandlerModule fx 处理器层模块
var HandlerModule = fx.Module("handler",
	fx.Provide(
		// User Handler
		userHandler.NewUserHandler,
		// File Handler
		fileHandler.NewFileHandler,
		// Item Handler
		itemHandler.NewItemHandler,
		// Tag Handler
		tagHandler.NewTagHandler,
	),
)
