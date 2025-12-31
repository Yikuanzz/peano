# 使用多阶段构建来优化镜像
# 第一阶段：构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端相关文件
COPY frontend/package.json frontend/bun.lock ./
COPY frontend/ .

# 安装依赖并构建前端
RUN npm install -g bun && \
    bun install && \
    bunx vite build

# 第二阶段：构建后端
FROM golang:1.24.2-alpine AS backend-builder

WORKDIR /app

# 安装 git 和 C 编译工具链（用于 CGO）
RUN apk add --no-cache \
    git \
    gcc \
    musl-dev


# 复制 go.mod 和 go.sum 文件
COPY backend/go.mod backend/go.sum ./

# 设置 GOPROXY 环境变量以提高下载依赖的速度
ENV GOPROXY=https://goproxy.cn,direct

# 下载依赖
RUN go mod download

# 复制后端源代码
COPY backend/ .

# 构建后端应用
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o peano-backend ./app/cmd/main.go

# 第三阶段：运行时镜像
FROM alpine:latest

# 安装 ca-certificates 以支持 HTTPS 请求
RUN apk --no-cache add ca-certificates tzdata

# 创建非 root 用户
RUN adduser -D -s /bin/sh peano

WORKDIR /app

# 从构建阶段复制后端二进制文件
COPY --from=backend-builder /app/peano-backend .
# 从构建阶段复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# 复制 SQLite 数据库（如果存在）
COPY backend/data.db ./data.db

# 复制上传目录（如果存在）
COPY backend/uploads ./uploads

# 创建必要的目录
RUN mkdir -p ./uploads ./logs && \
    chown -R peano:peano /app

# 切换到非 root 用户
USER peano

# 设置环境变量
ENV HTTP_PORT=8080
ENV SQLITE_DB_PATH=./data.db
ENV STORAGE_LOCAL_PATH=./uploads
ENV GIN_MODE=release

# 暴露端口（默认 8080）
EXPOSE 8080

# 启动命令
CMD ["./peano-backend"]
