# Peano

一个简洁优雅的便签管理应用，支持富文本编辑、标签管理、状态标记和图片上传。

## ✨ 功能特性

- 📝 **富文本编辑** - 支持粗体、斜体、列表等格式
- 🖼️ **图片上传** - 支持粘贴、拖拽上传图片
- 🏷️ **标签管理** - 自定义标签图标和颜色
- 📊 **状态标记** - 普通 / 已完成 / 标星三种状态
- 📅 **时间轴视图** - 按今天、昨天、前天分组展示
- 🌐 **国际化** - 支持中文、英文
- 📱 **响应式设计** - 完美支持移动端

## 🏗️ 技术栈

### 后端

- **Go** + **Gin** 框架
- **SQLite** 数据库（默认）
- **JWT** 认证
- **Uber FX** 依赖注入
- **Swagger** API 文档

### 前端

- **React** + **TypeScript**
- **Vite** 构建工具
- **TipTap** 富文本编辑器
- **shadcn/ui** 组件库
- **Zustand** 状态管理

## 🚀 快速开始

### 环境要求

- Go 1.20+
- Node.js 18+
- Bun（前端包管理器）

### 后端启动

```bash
cd backend/app

# 安装依赖
go mod tidy

# 启动服务（默认使用 SQLite）
go run cmd/main.go

# 或指定环境变量文件
go run cmd/main.go -env=.env
```

后端服务默认运行在 `http://localhost:8080`

### 前端启动

```bash
cd frontend

# 安装依赖
bun install

# 启动开发服务器
bun dev
```

前端默认运行在 `http://localhost:5173`

### 构建生产版本

```bash
cd frontend
bun run build
```

构建产物位于 `frontend/dist` 目录

## 📁 项目结构

```shell
peano/
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── cmd/            # 入口文件
│   │   ├── internal/       # 核心代码
│   │   │   ├── handler/    # HTTP 处理层
│   │   │   ├── logic/      # 业务逻辑层
│   │   │   ├── repo/       # 数据访问层
│   │   │   └── model/      # 数据模型
│   │   ├── plugins/        # 插件配置
│   │   ├── server/         # 服务器配置
│   │   ├── types/          # 类型定义
│   │   └── utils/          # 工具函数
│   ├── pkg/                # 外部包集成
│   └── uploads/            # 本地文件存储
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── store/         # 状态管理
│   │   ├── types/         # 类型定义
│   │   └── utils/         # 工具函数
│   └── dist/              # 构建产物
└── README.md
```

## ⚙️ 配置说明

### 后端环境变量

在 `backend/app` 目录创建 `.env` 文件：

```env
# 服务器配置
HTTP_PORT=8080
GIN_MODE=debug

# 数据库（SQLite 默认）
SQLITE_DB_PATH=data.db

# JWT 配置
JWT_SECRET=your-secret-key
ACCESS_TOKEN_EXPIRE=24h
REFRESH_TOKEN_EXPIRE=7d

# 存储配置
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./uploads
STORAGE_LOCAL_BASE_URL=http://localhost:8080/uploads

# 日志配置
LOG_LEVEL=info
LOG_OUTPUT=console
```

### API 文档

启动后端服务后，访问 `http://localhost:8080/swagger/index.html` 查看 Swagger 文档。

## 📝 主要接口

| 模块 | 接口 | 说明 |
|------|------|------|
| 用户 | POST /api/user/login | 用户登录 |
| 用户 | POST /api/user/register | 用户注册 |
| 便签 | GET /api/item/list | 获取便签列表 |
| 便签 | POST /api/item/create | 创建便签 |
| 便签 | PUT /api/item/update | 更新便签 |
| 便签 | DELETE /api/item/delete | 删除便签 |
| 标签 | GET /api/tag/list | 获取标签列表 |
| 标签 | POST /api/tag/create | 创建标签 |
| 文件 | POST /api/file/upload | 上传文件 |

## 🛠️ 开发工具

项目包含 Taskfile 配置文件，可使用以下命令：

```bash
# 查看可用任务
task --list
```
