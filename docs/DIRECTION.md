# Linux Systemd 管理后端服务

## 1、创建 systemd 服务文件

```shell
sudo vim /etc/systemd/system/peano-backend.service
```

文件写入内容如下

```ini
[Unit]
Description=Peano Backend Service
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/project/peano/backend
ExecStart=/root/project/peano/backend/peano-backend
Restart=always
RestartSec=5
Environment=PORT=8080
# 如果你的程序需要其他环境变量，可以继续加：
# Environment=DATABASE_URL=...

# 可选：限制资源
# LimitNOFILE=65536

# 日志（可选，通常用 journalctl 查看即可）
StandardOutput=journal
StandardError=journal
SyslogIdentifier=peano-backend

[Install]
WantedBy=multi-user.target
```

## 2、重载 systemd 配置

```shell
sudo systemctl daemon-reload
```

### 3、启用并启动服务

```shell
# 设置开机自启
sudo systemctl enable peano-backend

# 立即启动服务
sudo systemctl start peano-backend
```

### 4、验证状态

```shell
# 查看运行状态
sudo systemctl status peano-backend

# 查看实时日志
sudo journalctl -u peano-backend -f

# 查看最近 100 行日志
sudo journalctl -u peano-backend -n 100
```
