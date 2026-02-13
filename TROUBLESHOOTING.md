# All API Hub Docker 部署 - 故障排查指南

## 常见问题

### 1. 容器启动失败

#### 症状
运行 `docker-compose up -d` 后容器无法启动

#### 排查步骤

```bash
# 查看容器状态
docker-compose ps

# 查看详细日志
docker-compose logs

# 查看特定服务的日志
docker-compose logs server
docker-compose logs web
```

#### 可能原因及解决方案

**a. 端口被占用**

错误信息: `Bind for 0.0.0.0:80 failed: port is already allocated`

解决方案:
```bash
# 检查端口占用
sudo lsof -i :80
sudo lsof -i :3000

# 修改 docker-compose.yml 中的端口映射
# 例如将 "80:80" 改为 "8080:80"
```

**b. Docker 磁盘空间不足**

解决方案:
```bash
# 清理未使用的镜像和容器
docker system prune -a

# 查看磁盘使用
docker system df
```

**c. 权限问题**

解决方案:
```bash
# 确保数据目录有正确权限
mkdir -p data
chmod 755 data

# 如果使用 SELinux，可能需要调整上下文
chcon -Rt svirt_sandbox_file_t data/
```

### 2. 数据库错误

#### 症状
服务启动但无法创建或访问数据库

#### 排查步骤

```bash
# 查看服务器日志
docker-compose logs server | grep -i error

# 进入容器检查
docker-compose exec server sh
ls -la /app/data
```

#### 解决方案

**a. 数据目录不存在或无权限**

```bash
# 停止服务
docker-compose down

# 确保目录存在
mkdir -p data

# 重新启动
docker-compose up -d
```

**b. 数据库文件损坏**

```bash
# 备份现有数据库（如果可以访问）
cp data/app.db data/app.db.backup

# 删除损坏的数据库（将创建新数据库）
rm data/app.db

# 重启服务
docker-compose restart server
```

### 3. 无法访问 Web 界面

#### 症状
浏览器无法打开 http://localhost

#### 排查步骤

```bash
# 检查容器是否运行
docker-compose ps

# 检查端口映射
docker-compose port web 80

# 测试 nginx 配置
docker-compose exec web nginx -t
```

#### 解决方案

**a. 容器未正确启动**

```bash
# 重启服务
docker-compose restart web

# 查看日志
docker-compose logs web
```

**b. nginx 配置错误**

```bash
# 检查 nginx 配置语法
docker-compose exec web nginx -t

# 重新加载配置
docker-compose exec web nginx -s reload
```

**c. 防火墙阻止**

```bash
# 检查防火墙规则（Linux）
sudo iptables -L -n

# 允许 80 端口（Ubuntu/Debian）
sudo ufw allow 80

# 允许 80 端口（CentOS/RHEL）
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload
```

### 4. API 请求失败

#### 症状
前端加载但无法获取数据，控制台显示 API 错误

#### 排查步骤

```bash
# 测试后端健康检查
curl http://localhost:3000/health

# 测试 API 端点
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### 解决方案

**a. 后端服务未运行**

```bash
# 检查服务状态
docker-compose ps server

# 重启后端
docker-compose restart server
```

**b. CORS 配置问题**

编辑 `.env` 文件:
```env
CORS_ORIGIN=http://localhost
```

重启服务:
```bash
docker-compose restart server
```

**c. 网络问题**

```bash
# 检查容器网络
docker network ls
docker network inspect all-api-hub-fork_app-network

# 重新创建网络
docker-compose down
docker-compose up -d
```

### 5. 登录失败

#### 症状
使用默认用户名密码无法登录

#### 排查步骤

```bash
# 查看服务器日志
docker-compose logs server | grep -i login

# 进入容器检查数据库
docker-compose exec server sh
sqlite3 /app/data/app.db "SELECT username FROM users;"
```

#### 解决方案

**a. 默认用户未创建**

```bash
# 查看日志确认是否创建了默认用户
docker-compose logs server | grep "Created default admin user"

# 如果没有，重新初始化数据库
docker-compose down
rm data/app.db
docker-compose up -d
```

**b. 密码不正确**

检查 `.env` 文件中的 `DEFAULT_ADMIN_PASSWORD`

**c. JWT 密钥问题**

确保 `.env` 文件中有正确的 `JWT_SECRET`

### 6. 构建失败

#### 症状
运行 `docker-compose build` 失败

#### 排查步骤

```bash
# 查看构建日志
docker-compose build --no-cache

# 单独构建每个服务
cd server && docker build .
cd web-app && docker build .
```

#### 解决方案

**a. 网络问题（无法下载依赖）**

```bash
# 使用国内镜像源（中国用户）
# 编辑 server/Dockerfile，在 RUN npm install 前添加:
# RUN npm config set registry https://registry.npmmirror.com
```

**b. 缓存问题**

```bash
# 清除构建缓存
docker builder prune -a

# 重新构建
docker-compose build --no-cache
```

### 7. 性能问题

#### 症状
服务响应缓慢

#### 排查步骤

```bash
# 查看容器资源使用
docker stats

# 查看日志中的错误
docker-compose logs | grep -i error
```

#### 解决方案

**a. 内存不足**

编辑 `docker-compose.yml` 添加资源限制:
```yaml
services:
  server:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

**b. 数据库性能**

考虑切换到 PostgreSQL 或 MySQL

**c. 日志过多**

```bash
# 限制日志大小
# 编辑 docker-compose.yml
services:
  server:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 8. 数据丢失

#### 症状
重启后数据丢失

#### 原因
可能使用了 `docker-compose down -v`（会删除 volumes）

#### 预防措施

```bash
# 定期备份
mkdir -p backups
cp data/app.db backups/app.db.$(date +%Y%m%d_%H%M%S)

# 设置自动备份（crontab）
0 2 * * * cd /path/to/all-api-hub-fork && cp data/app.db backups/app.db.$(date +\%Y\%m\%d)
```

#### 恢复数据

```bash
# 停止服务
docker-compose down

# 恢复备份
cp backups/app.db.20240101 data/app.db

# 重启服务
docker-compose up -d
```

## 调试技巧

### 进入容器调试

```bash
# 进入后端容器
docker-compose exec server sh

# 进入前端容器
docker-compose exec web sh

# 查看文件
ls -la /app

# 查看环境变量
env | grep -i jwt
```

### 查看详细日志

```bash
# 实时查看所有日志
docker-compose logs -f

# 查看最近 100 行日志
docker-compose logs --tail=100

# 只查看错误
docker-compose logs | grep -i error
```

### 测试数据库连接

```bash
# 进入容器
docker-compose exec server sh

# 连接数据库
sqlite3 /app/data/app.db

# 查看表
.tables

# 查看用户
SELECT * FROM users;

# 退出
.quit
```

### 网络调试

```bash
# 查看容器 IP
docker-compose exec server hostname -i

# 测试容器间连接
docker-compose exec web ping server

# 从宿主机测试
curl http://localhost:3000/health
```

## 获取帮助

如果以上方法都无法解决问题，请：

1. 收集完整日志:
```bash
docker-compose logs > debug.log
```

2. 收集系统信息:
```bash
docker version
docker-compose version
uname -a
```

3. 提交 Issue 时提供:
   - 详细的错误信息
   - 操作系统和 Docker 版本
   - 完整的日志文件
   - 重现步骤

## 重置所有设置

**警告：这将删除所有数据！**

```bash
# 停止并删除所有容器和数据
docker-compose down -v

# 删除数据目录
rm -rf data

# 重新创建 .env
cp .env.example .env

# 重新启动
docker-compose up -d
```
