#!/bin/bash

# All API Hub Docker 部署快速启动脚本

set -e

echo "===================================="
echo "All API Hub - Docker 部署"
echo "===================================="
echo ""

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未安装 Docker"
    echo "请访问 https://docs.docker.com/get-docker/ 安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: 未安装 Docker Compose"
    echo "请访问 https://docs.docker.com/compose/install/ 安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "📝 创建 .env 配置文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，修改 JWT_SECRET 等配置（生产环境必需）"
    echo ""
fi

# 创建数据目录
if [ ! -d data ]; then
    echo "📁 创建数据目录..."
    mkdir -p data
fi

echo "🚀 启动服务..."
echo ""

# 检测 docker compose 命令格式
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# 启动服务
$DOCKER_COMPOSE up -d

echo ""
echo "✅ 服务启动成功！"
echo ""
echo "===================================="
echo "访问信息:"
echo "===================================="
echo "🌐 Web 界面: http://localhost"
echo "🔌 API 地址: http://localhost:3000"
echo ""
echo "===================================="
echo "默认登录信息:"
echo "===================================="
echo "👤 用户名: admin"
echo "🔑 密码: admin123 (或您在 .env 中设置的密码)"
echo ""
echo "⚠️  首次登录后请立即修改密码！"
echo ""
echo "===================================="
echo "常用命令:"
echo "===================================="
echo "查看日志: $DOCKER_COMPOSE logs -f"
echo "停止服务: $DOCKER_COMPOSE down"
echo "重启服务: $DOCKER_COMPOSE restart"
echo ""
