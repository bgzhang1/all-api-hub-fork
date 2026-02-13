.PHONY: help start stop restart logs build clean test

help: ## 显示帮助信息
	@echo "All API Hub - Docker 部署"
	@echo ""
	@echo "可用命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

start: ## 启动服务
	@echo "🚀 启动服务..."
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@docker-compose up -d
	@echo "✅ 服务已启动！"
	@echo "🌐 Web 界面: http://localhost"
	@echo "🔌 API 地址: http://localhost:3000"

stop: ## 停止服务
	@echo "🛑 停止服务..."
	@docker-compose down
	@echo "✅ 服务已停止"

restart: ## 重启服务
	@echo "🔄 重启服务..."
	@docker-compose restart
	@echo "✅ 服务已重启"

logs: ## 查看日志
	@docker-compose logs -f

build: ## 重新构建镜像
	@echo "🔨 重新构建镜像..."
	@docker-compose build --no-cache
	@echo "✅ 镜像构建完成"

clean: ## 清理容器和数据（危险！会删除所有数据）
	@echo "⚠️  警告: 这将删除所有容器和数据！"
	@read -p "确认继续？(y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	@docker-compose down -v
	@rm -rf data
	@echo "✅ 清理完成"

test: ## 测试构建
	@echo "🧪 测试 Docker 构建..."
	@docker-compose build
	@echo "✅ 构建测试通过"

install-dev: ## 安装开发依赖
	@echo "📦 安装后端依赖..."
	@cd server && npm install
	@echo "📦 安装前端依赖..."
	@cd web-app && npm install
	@echo "✅ 依赖安装完成"

dev-server: ## 启动后端开发服务器
	@cd server && npm run dev

dev-web: ## 启动前端开发服务器
	@cd web-app && npm run dev

backup: ## 备份数据库
	@mkdir -p backups
	@cp ./data/app.db ./backups/app.db.$$(date +%Y%m%d_%H%M%S)
	@echo "✅ 数据库已备份到 backups/"
