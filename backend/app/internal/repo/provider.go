package repo

import (
	fileLogic "backend/app/internal/logic/file"
	itemLogic "backend/app/internal/logic/item"
	tagLogic "backend/app/internal/logic/tag"
	userLogic "backend/app/internal/logic/user"
	baseRepo "backend/app/internal/repo/base"
	fileRepo "backend/app/internal/repo/file"
	itemRepo "backend/app/internal/repo/item"
	sysRepo "backend/app/internal/repo/sys"
	tagRepo "backend/app/internal/repo/tag"
	userRepo "backend/app/internal/repo/user"

	"go.uber.org/fx"
)

var RepoModule = fx.Module("repo",
	fx.Provide(
		// User Repo
		fx.Annotate(
			userRepo.NewUserRepo,
			fx.As(new(userLogic.UserRepo)),
			fx.As(new(baseRepo.UserRepo)),
		),
		// Sys Repo
		fx.Annotate(
			sysRepo.NewSysRepo,
			fx.As(new(baseRepo.SysRepo)),
		),
		// File Repo
		fx.Annotate(
			fileRepo.NewFileRepo,
			fx.As(new(fileLogic.FileRepo)),
		),
		// Item Repo
		fx.Annotate(
			itemRepo.NewItemRepo,
			fx.As(new(itemLogic.ItemRepo)),
		),
		// Tag Repo
		fx.Annotate(
			tagRepo.NewTagRepo,
			fx.As(new(tagLogic.TagRepo)),
			fx.As(new(itemLogic.ItemTagRepo)),
		),
	),
	// 初始化基础数据
	fx.Invoke(baseRepo.InitBaseData),
)
