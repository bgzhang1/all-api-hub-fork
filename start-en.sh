#!/bin/bash

# All API Hub Docker Deployment Quick Start Script

set -e

echo "===================================="
echo "All API Hub - Docker Deployment"
echo "===================================="
echo ""

# Check Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker not installed"
    echo "Please visit https://docs.docker.com/get-docker/ to install Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose not installed"
    echo "Please visit https://docs.docker.com/compose/install/ to install Docker Compose"
    exit 1
fi

echo "✅ Docker environment check passed"
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env configuration file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and modify JWT_SECRET (required for production)"
    echo ""
fi

# Create data directory
if [ ! -d data ]; then
    echo "📁 Creating data directory..."
    mkdir -p data
fi

echo "🚀 Starting services..."
echo ""

# Detect docker compose command format
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Start services
$DOCKER_COMPOSE up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "===================================="
echo "Access Information:"
echo "===================================="
echo "🌐 Web Interface: http://localhost"
echo "🔌 API Endpoint: http://localhost:3000"
echo ""
echo "===================================="
echo "Default Login Credentials:"
echo "===================================="
echo "👤 Username: admin"
echo "🔑 Password: admin123 (or the password you set in .env)"
echo ""
echo "⚠️  Please change password after first login!"
echo ""
echo "===================================="
echo "Common Commands:"
echo "===================================="
echo "View logs: $DOCKER_COMPOSE logs -f"
echo "Stop services: $DOCKER_COMPOSE down"
echo "Restart services: $DOCKER_COMPOSE restart"
echo ""
