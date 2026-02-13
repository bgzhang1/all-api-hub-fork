# All API Hub - 架构说明

## 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          用户浏览器                               │
│                      http://localhost                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Nginx (Web 容器)                           │
│                         Port: 80                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React SPA (静态文件)                                       │ │
│  │  - 登录/注册页面                                            │ │
│  │  - 账户管理面板                                             │ │
│  │  - 模型管理                                                 │ │
│  │  - 数据可视化                                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             │ /api/* 反向代理                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              │ HTTP
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express Server (后端容器)                     │
│                         Port: 3000                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  REST API 端点                                              │ │
│  │  - POST /api/auth/login                                    │ │
│  │  - POST /api/auth/register                                 │ │
│  │  - GET  /api/accounts                                      │ │
│  │  - POST /api/accounts                                      │ │
│  │  - PUT  /api/accounts/:id                                  │ │
│  │  - DELETE /api/accounts/:id                                │ │
│  │  - GET  /api/accounts/:id/tokens                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  中间件层                                                   │ │
│  │  - JWT 认证                                                │ │
│  │  - CORS 处理                                               │ │
│  │  - 错误处理                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  业务逻辑层                                                 │ │
│  │  - 用户管理                                                │ │
│  │  - 账户操作                                                │ │
│  │  - Token 管理                                              │ │
│  │  - 数据验证                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  数据访问层                                                 │ │
│  │  - SQLite 操作                                             │ │
│  │  - 查询构建                                                │ │
│  │  - 事务管理                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              │ SQL
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SQLite 数据库                                 │
│                    (./data/app.db)                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  数据表                                                     │ │
│  │  - users            (用户表)                               │ │
│  │  - accounts         (账户表)                               │ │
│  │  - account_tokens   (API Token表)                          │ │
│  │  - user_preferences (用户偏好设置)                          │ │
│  │  - usage_history    (使用历史)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Volume Mount
                              │
                              ▼
                      ./data/ (宿主机目录)
                      数据持久化存储
```

## 网络架构

```
┌────────────────────────────────────────────────────────────────┐
│                      Docker 网络 (Bridge)                        │
│                      app-network                                 │
│                                                                  │
│   ┌─────────────────┐              ┌─────────────────┐          │
│   │   web 容器      │              │  server 容器     │          │
│   │   (nginx)       │──────────────│  (express)      │          │
│   │   Port: 80      │   内部通信   │   Port: 3000    │          │
│   └────────┬────────┘              └────────┬────────┘          │
│            │                                │                   │
└────────────┼────────────────────────────────┼───────────────────┘
             │                                │
             │ 端口映射                        │ 端口映射
             │ 80:80                          │ 3000:3000
             │                                │
        ┌────▼────────────────────────────────▼─────┐
        │              宿主机                        │
        │         (VPS/本地机器)                     │
        └───────────────────────────────────────────┘
```

## 数据流向

### 1. 用户登录流程

```
用户浏览器
    │
    │ 1. 访问 http://localhost
    ▼
Nginx (Web 容器)
    │
    │ 2. 返回 React SPA
    ▼
React App (浏览器端)
    │
    │ 3. 用户输入用户名密码
    │ 4. POST /api/auth/login
    ▼
Nginx
    │
    │ 5. 代理到后端
    ▼
Express Server (后端容器)
    │
    │ 6. 验证用户名密码
    │ 7. 查询数据库
    ▼
SQLite 数据库
    │
    │ 8. 返回用户信息
    ▼
Express Server
    │
    │ 9. 生成 JWT Token
    │ 10. 返回 Token + 用户信息
    ▼
React App
    │
    │ 11. 存储 Token 到 localStorage
    │ 12. 跳转到主页面
    ▼
用户看到主界面
```

### 2. 获取账户列表流程

```
React App
    │
    │ 1. GET /api/accounts
    │    Authorization: Bearer <token>
    ▼
Nginx
    │
    │ 2. 代理请求
    ▼
Express Server
    │
    │ 3. 验证 JWT Token
    │ 4. 提取 userId
    │ 5. 查询数据库
    ▼
SQLite
    │
    │ 6. SELECT * FROM accounts WHERE user_id = ?
    │ 7. 返回账户列表
    ▼
Express Server
    │
    │ 8. JSON 格式化
    │ 9. 返回响应
    ▼
React App
    │
    │ 10. 显示账户列表
    ▼
用户界面更新
```

## 技术栈

### 前端 (web-app/)
- **框架**: React 19
- **构建工具**: Vite
- **UI 框架**: Tailwind CSS
- **HTTP 客户端**: Axios
- **状态管理**: TanStack Query (React Query)
- **路由**: React Router
- **Web 服务器**: Nginx (生产环境)

### 后端 (server/)
- **运行时**: Node.js 20
- **框架**: Express
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **定时任务**: node-cron (计划中)

### DevOps
- **容器化**: Docker
- **编排**: Docker Compose
- **CI/CD**: GitHub Actions
- **反向代理**: Nginx

## 目录结构

```
all-api-hub-fork/
├── server/                      # 后端服务
│   ├── src/
│   │   ├── config/             # 配置文件
│   │   │   └── index.ts        # 环境变量配置
│   │   ├── db/                 # 数据库
│   │   │   └── database.ts     # 数据库初始化和连接
│   │   ├── middleware/         # 中间件
│   │   │   └── auth.ts         # JWT 认证中间件
│   │   ├── routes/             # API 路由
│   │   │   ├── auth.ts         # 认证相关路由
│   │   │   └── accounts.ts     # 账户管理路由
│   │   ├── __tests__/          # 测试文件
│   │   └── index.ts            # 服务器入口
│   ├── Dockerfile              # Docker 镜像定义
│   ├── package.json            # 依赖管理
│   └── tsconfig.json           # TypeScript 配置
│
├── web-app/                     # 前端应用
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   │   ├── LoginPage.tsx   # 登录页面
│   │   │   └── DashboardPage.tsx # 主面板
│   │   ├── services/           # API 服务层
│   │   │   ├── api.ts          # Axios 配置
│   │   │   ├── auth.ts         # 认证服务
│   │   │   └── accounts.ts     # 账户服务
│   │   ├── styles/             # 样式文件
│   │   ├── App.tsx             # 主应用组件
│   │   └── main.tsx            # 入口文件
│   ├── Dockerfile              # Docker 镜像定义
│   ├── nginx.conf              # Nginx 配置
│   ├── package.json            # 依赖管理
│   └── vite.config.ts          # Vite 配置
│
├── data/                        # 数据目录 (git ignored)
│   └── app.db                  # SQLite 数据库文件
│
├── .github/workflows/           # CI/CD 配置
│   └── docker-build.yml        # Docker 构建测试
│
├── docker-compose.yml          # Docker 编排配置
├── Makefile                    # 常用命令快捷方式
├── start.sh                    # 快速启动脚本
├── .env.example                # 环境变量示例
└── README_DOCKER.md            # Docker 部署文档
```

## 安全架构

### 认证流程

```
1. 用户提交用户名和密码
   ↓
2. 服务器验证凭据
   ↓
3. 生成 JWT Token (包含 userId)
   ↓
4. 返回 Token 给客户端
   ↓
5. 客户端存储 Token 到 localStorage
   ↓
6. 后续请求在 Header 中携带 Token
   Authorization: Bearer <token>
   ↓
7. 服务器验证 Token
   ↓
8. 提取 userId 并处理请求
```

### 数据隔离

- 每个用户只能访问自己的数据
- 所有 API 请求都经过 JWT 验证
- 数据库查询都包含 `user_id` 过滤条件

### 密码安全

- 密码使用 bcrypt 加密存储（10 rounds）
- 数据库中不存储明文密码
- JWT Token 有过期时间限制

## 扩展性考虑

### 垂直扩展

```yaml
# docker-compose.yml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### 水平扩展

可以添加负载均衡器：

```
        ┌─────────┐
        │  Nginx  │
        │  Load   │
        │ Balancer│
        └────┬────┘
             │
      ┌──────┴──────┐
      │             │
   ┌──▼──┐       ┌──▼──┐
   │Server│       │Server│
   │  #1  │       │  #2  │
   └──┬──┘       └──┬──┘
      │             │
      └──────┬──────┘
             │
        ┌────▼────┐
        │Database │
        │(Shared) │
        └─────────┘
```

### 数据库升级

当数据量增大时，可以迁移到 PostgreSQL 或 MySQL：

1. 导出 SQLite 数据
2. 转换格式
3. 导入到新数据库
4. 更新连接配置

## 监控和日志

### 日志收集

```bash
# 查看实时日志
docker-compose logs -f

# 导出日志
docker-compose logs > app.log
```

### 健康检查

```bash
# API 健康检查端点
curl http://localhost:3000/health

# 返回示例
{"status":"ok","timestamp":1234567890}
```

### 性能监控

考虑添加：
- Prometheus (指标收集)
- Grafana (可视化)
- ELK Stack (日志分析)

## 备份策略

### 自动备份脚本

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# 备份数据库
cp ./data/app.db "$BACKUP_DIR/app.db.$DATE"

# 保留最近 30 天的备份
find "$BACKUP_DIR" -name "app.db.*" -mtime +30 -delete

echo "Backup completed: app.db.$DATE"
```

### 定时备份（crontab）

```cron
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

## 恢复流程

```bash
# 1. 停止服务
docker-compose down

# 2. 恢复备份
cp backups/app.db.20240101_020000 data/app.db

# 3. 重启服务
docker-compose up -d
```
