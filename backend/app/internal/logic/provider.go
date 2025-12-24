package logic

import (
	fileHandler "backend/app/internal/handler/file"
	itemHandler "backend/app/internal/handler/item"
	tagHandler "backend/app/internal/handler/tag"
	userHandler "backend/app/internal/handler/user"
	fileLogic "backend/app/internal/logic/file"
	itemLogic "backend/app/internal/logic/item"
	tagLogic "backend/app/internal/logic/tag"
	userLogic "backend/app/internal/logic/user"

	"go.uber.org/fx"
)

// LogicModule fx 业务逻辑层模块
var LogicModule = fx.Module("logic",
	fx.Provide(
		// User Logic
		fx.Annotate(
			userLogic.NewUserLogic,
			fx.As(new(userHandler.UserLogic)),
		),
		// File Logic
		fx.Annotate(
			fileLogic.NewFileLogic,
			fx.As(new(fileHandler.FileLogic)),
		),
		// Item Logic
		fx.Annotate(
			itemLogic.NewItemLogic,
			fx.As(new(itemHandler.ItemLogic)),
		),
		// Tag Logic
		fx.Annotate(
			tagLogic.NewTagLogic,
			fx.As(new(tagHandler.TagLogic)),
		),
	),
)
