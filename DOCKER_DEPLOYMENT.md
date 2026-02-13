# All API Hub - Docker 部署版本

这是 All API Hub 的 Docker 部署版本，将原本的浏览器扩展改造为可以在 VPS 上长期运行的 Web 应用。

## 架构

该项目采用前后端分离架构：

- **后端 (server/)**: Express + SQLite 提供 REST API
- **前端 (web-app/)**: React + Vite 构建的单页应用
- **反向代理**: Nginx 提供前端服务并代理 API 请求

## 快速开始

### 使用 Docker Compose（推荐）

1. 克隆项目:
```bash
git clone <repository-url>
cd all-api-hub-fork
```

2. 配置环境变量（可选）:
```bash
cp .env.example .env
# 编辑 .env 文件，修改 JWT_SECRET 等配置
```

3. 启动服务:
```bash
docker-compose up -d
```

4. 访问应用:
- 打开浏览器访问: http://localhost
- 默认管理员账号: `admin`
- 默认密码: `admin123`（或您在 .env 中设置的密码）

5. 停止服务:
```bash
docker-compose down
```

### 手动部署

#### 后端部署

```bash
cd server

# 安装依赖
npm install

# 构建
npm run build

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 启动
npm start
```

#### 前端部署

```bash
cd web-app

# 安装依赖
npm install

# 构建
npm run build

# 使用 nginx 或其他 web 服务器托管 dist 目录
```

## 配置说明

### 环境变量

在项目根目录的 `.env` 文件中配置：

- `JWT_SECRET`: JWT 密钥（**生产环境必须修改**）
- `JWT_EXPIRES_IN`: Token 过期时间（默认 7 天）
- `CORS_ORIGIN`: CORS 允许的来源（生产环境建议设置具体域名）
- `DEFAULT_ADMIN_PASSWORD`: 默认管理员密码（首次运行时创建）

### 端口配置

默认端口：
- 前端: 80
- 后端 API: 3000

可以在 `docker-compose.yml` 中修改端口映射。

## 数据持久化

数据存储在 SQLite 数据库中，通过 Docker volume 持久化到 `./data` 目录。

备份数据：
```bash
# 备份数据库文件
cp ./data/app.db ./backup/app.db.$(date +%Y%m%d)
```

## 功能特性

- ✅ 用户认证（JWT）
- ✅ 账户管理（CRUD）
- ✅ 数据持久化（SQLite）
- ✅ Docker 部署
- ✅ 前后端分离
- ⚠️  部分浏览器特定功能已移除或需要重新实现：
  - ❌ Cloudflare 过盾（依赖浏览器窗口）
  - ❌ Cookie 拦截器（依赖浏览器扩展 API）
  - ⚠️  自动刷新需要后端定时任务实现
  - ⚠️  WebDAV 同步需要迁移到后端

## 开发

### 后端开发

```bash
cd server
npm install
npm run dev  # 使用 tsx watch 模式
```

### 前端开发

```bash
cd web-app
npm install
npm run dev  # Vite 开发服务器
```

## 从浏览器扩展迁移

原浏览器扩展的数据可以通过以下方式迁移：

1. 从浏览器扩展导出数据
2. 使用迁移工具将数据导入到新的 SQLite 数据库
3. 重启服务

## 安全建议

1. **修改默认密码**: 首次登录后立即修改管理员密码
2. **修改 JWT_SECRET**: 生产环境必须使用强随机密钥
3. **配置 CORS**: 生产环境设置具体的允许域名
4. **使用 HTTPS**: 建议使用反向代理（如 Caddy、Traefik）配置 HTTPS
5. **定期备份**: 定期备份数据库文件

## 生产环境部署建议

### 使用 Caddy 配置 HTTPS

创建 `Caddyfile`:
```
your-domain.com {
    reverse_proxy localhost:80
}
```

### 使用 Nginx 配置 HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 故障排查

### 连接被拒绝

检查服务是否正常运行：
```bash
docker-compose ps
```

查看日志：
```bash
docker-compose logs -f
```

### 数据库错误

确保数据目录有正确的权限：
```bash
chmod 755 ./data
```

### 前端无法连接后端

检查 nginx 配置中的代理设置，确保指向正确的后端服务。

## 许可证

与原项目保持一致的开源许可证。

## 贡献

欢迎提交 Issue 和 Pull Request！
