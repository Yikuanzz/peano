package router

import (
	"backend/app/internal/handler/file"
	"backend/app/internal/handler/item"
	"backend/app/internal/handler/tag"
	"backend/app/internal/handler/user"
	"backend/app/server/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAPIRouter 设置 API 路由
// userHandler: User 处理器
// fileHandler: File 处理器
// itemHandler: Item 处理器
// tagHandler: Tag 处理器
func SetupAPIRouter(r *gin.Engine, userHandler *user.UserHandler, fileHandler *file.FileHandler, itemHandler *item.ItemHandler, tagHandler *tag.TagHandler) {
	api := r.Group("/api")

	// 用户相关路由
	{
		userGroup := api.Group("/user")
		userGroup.POST("/login", userHandler.Login)
		userGroup.POST("/refresh-token", userHandler.RefreshToken)
		// 需要认证的路由
		userGroupAuth := userGroup.Group("")
		userGroupAuth.Use(middleware.AuthMiddleware())
		userGroupAuth.GET("/info", userHandler.GetUserInfo)
		userGroupAuth.PUT("/info", userHandler.UpateUserInfo)
	}

	// 文件相关路由
	{
		fileGroup := api.Group("/file")
		fileGroup.POST("/upload", fileHandler.UploadFile)
	}

	// 项目相关路由（需要认证）
	{
		itemGroup := api.Group("/item")
		itemGroup.Use(middleware.AuthMiddleware())
		itemGroup.POST("", itemHandler.CreateItem)
		itemGroup.GET("/list", itemHandler.GetItemList)
		itemGroup.GET("/daily-count", itemHandler.GetDailyItemCount)
		itemGroup.GET("/:item_id", itemHandler.GetItem)
		itemGroup.PUT("/:item_id", itemHandler.UpdateItem)
		itemGroup.DELETE("/:item_id", itemHandler.DeleteItem)
	}

	// 标签相关路由（需要认证）
	{
		tagGroup := api.Group("/tag")
		tagGroup.Use(middleware.AuthMiddleware())
		tagGroup.POST("", tagHandler.CreateTag)
		tagGroup.GET("/list", tagHandler.GetTagList)
		tagGroup.GET("/:tag_id", tagHandler.GetTag)
		tagGroup.PUT("/:tag_id", tagHandler.UpdateTag)
		tagGroup.DELETE("/:tag_id", tagHandler.DeleteTag)
	}
}
