# All API Hub - Docker 部署版本

> 本项目基于 [All API Hub](https://github.com/qixing-jk/all-api-hub) 浏览器扩展改造，支持 Docker 部署，可在 VPS 上长期运行。

## 🚀 快速开始

### 方式一：使用快速启动脚本（推荐）

```bash
# 克隆项目
git clone https://github.com/bgzhang1/all-api-hub-fork.git
cd all-api-hub-fork

# 运行启动脚本
./start.sh
```

访问 http://localhost，使用默认账号 `admin` / `admin123` 登录。

### 方式二：手动启动

```bash
# 1. 复制环境变量配置文件
cp .env.example .env

# 2. 编辑 .env 文件（可选，建议修改 JWT_SECRET）
nano .env

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

## 📖 完整文档

- [Docker 部署文档（中文）](./DOCKER_DEPLOYMENT.md)
- [Docker Deployment Guide (English)](./DOCKER_DEPLOYMENT_EN.md)

## 🏗️ 项目架构

```
all-api-hub-fork/
├── server/              # 后端服务 (Express + SQLite)
│   ├── src/
│   │   ├── db/         # 数据库配置和初始化
│   │   ├── routes/     # API 路由
│   │   ├── middleware/ # 认证中间件
│   │   └── config/     # 配置文件
│   └── Dockerfile
│
├── web-app/            # 前端应用 (React SPA)
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── services/   # API 服务
│   │   └── components/ # UI 组件
│   ├── Dockerfile
│   └── nginx.conf      # Nginx 配置
│
└── docker-compose.yml  # Docker 编排配置
```

## ✨ 主要功能

- ✅ **用户认证**: JWT 令牌认证
- ✅ **账户管理**: 完整的 CRUD 操作
- ✅ **数据持久化**: SQLite 数据库
- ✅ **Docker 部署**: 一键启动
- ✅ **前后端分离**: REST API 架构
- ✅ **响应式界面**: 支持桌面和移动设备

## 🔒 安全建议

**生产环境部署前务必：**

1. 修改 `.env` 文件中的 `JWT_SECRET`
2. 修改默认管理员密码
3. 配置 HTTPS（使用 Caddy 或 Nginx）
4. 限制 `CORS_ORIGIN` 到特定域名
5. 定期备份数据库文件（`./data/app.db`）

## 📝 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# JWT 密钥（生产环境必须修改！）
JWT_SECRET=your-very-secure-secret-key-here

# Token 过期时间
JWT_EXPIRES_IN=7d

# CORS 允许的来源（生产环境建议设置为具体域名）
CORS_ORIGIN=*

# 默认管理员密码（仅首次运行时使用）
DEFAULT_ADMIN_PASSWORD=your-secure-password
```

## 🛠️ 开发指南

### 后端开发

```bash
cd server
npm install
npm run dev  # 开发模式（tsx watch）
```

### 前端开发

```bash
cd web-app
npm install
npm run dev  # Vite 开发服务器
```

## 🌐 生产环境部署

### 使用 Caddy（推荐，自动 HTTPS）

创建 `Caddyfile`:

```
your-domain.com {
    reverse_proxy localhost:80
}
```

启动 Caddy:

```bash
caddy run
```

### 使用 Nginx

参考 [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) 中的 Nginx 配置示例。

## 📊 数据备份

定期备份数据库：

```bash
# 创建备份目录
mkdir -p backups

# 备份数据库
cp ./data/app.db ./backups/app.db.$(date +%Y%m%d_%H%M%S)
```

设置自动备份（cron）:

```bash
# 每天凌晨 2 点备份
0 2 * * * cd /path/to/all-api-hub-fork && cp ./data/app.db ./backups/app.db.$(date +\%Y\%m\%d)
```

## 🔧 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps

# 重新构建镜像
docker-compose build --no-cache

# 清理所有容器和数据（危险！）
docker-compose down -v
```

## ❓ 故障排查

### 无法访问服务

```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 数据库错误

```bash
# 检查数据目录权限
ls -la ./data

# 确保目录存在且有正确权限
mkdir -p ./data
chmod 755 ./data
```

### 端口冲突

如果 80 或 3000 端口被占用，修改 `docker-compose.yml` 中的端口映射：

```yaml
services:
  web:
    ports:
      - "8080:80"  # 改为 8080
  server:
    ports:
      - "3001:3000"  # 改为 3001
```

## 🆚 浏览器扩展 vs Docker 版本

| 功能 | 浏览器扩展 | Docker 版本 |
|------|-----------|------------|
| 部署方式 | 浏览器安装 | VPS/服务器 |
| 数据存储 | 浏览器本地 | SQLite 数据库 |
| 多用户支持 | ❌ | ✅ |
| 远程访问 | ❌ | ✅ |
| Cloudflare 过盾 | ✅ | ❌ (需重新设计) |
| Cookie 拦截 | ✅ | ❌ (需重新设计) |
| 自动刷新 | ✅ | ⚠️ (需后端实现) |
| WebDAV 同步 | ✅ | ⚠️ (需迁移) |

## 🚧 已知限制

从浏览器扩展转换为 Web 应用，部分依赖浏览器特性的功能需要重新设计：

- ❌ **Cloudflare 过盾**: 原功能依赖浏览器窗口，需要重新设计绕过方案
- ❌ **Cookie 拦截器**: 原功能依赖浏览器扩展 API，需要改为后端处理
- ⚠️ **自动刷新**: 需要实现后端定时任务
- ⚠️ **WebDAV 同步**: 需要迁移到后端实现

## 🔮 未来计划

- [ ] 实现更多 API 端点（token 管理、模型同步等）
- [ ] 实现后端定时任务（自动刷新）
- [ ] WebDAV 同步迁移到后端
- [ ] 数据迁移工具（从浏览器扩展导入）
- [ ] 完善前端 UI（复用原有组件库）
- [ ] 添加单元测试和集成测试
- [ ] 多语言支持（i18n）
- [ ] 用户权限管理

## 📄 许可证

与原项目保持一致的开源许可证。

## 🙏 致谢

本项目基于 [All API Hub](https://github.com/qixing-jk/all-api-hub) 改造，感谢原作者的优秀工作。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请提交 Issue。
