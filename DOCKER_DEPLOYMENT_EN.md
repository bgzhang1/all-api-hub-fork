# All API Hub - Docker Deployment Version

This is the Docker deployment version of All API Hub, transformed from a browser extension into a web application that can run continuously on a VPS.

## Architecture

This project uses a separated frontend and backend architecture:

- **Backend (server/)**: Express + SQLite providing REST API
- **Frontend (web-app/)**: Single Page Application built with React + Vite
- **Reverse Proxy**: Nginx serves frontend and proxies API requests

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the project:
```bash
git clone <repository-url>
cd all-api-hub-fork
```

2. Configure environment variables (optional):
```bash
cp .env.example .env
# Edit .env file to modify JWT_SECRET and other settings
```

3. Start services:
```bash
docker-compose up -d
```

4. Access the application:
- Open browser: http://localhost
- Default admin username: `admin`
- Default password: `admin123` (or the password you set in .env)

5. Stop services:
```bash
docker-compose down
```

### Manual Deployment

#### Backend Deployment

```bash
cd server

# Install dependencies
npm install

# Build
npm run build

# Configure environment variables
cp .env.example .env
# Edit .env file

# Start
npm start
```

#### Frontend Deployment

```bash
cd web-app

# Install dependencies
npm install

# Build
npm run build

# Serve dist directory with nginx or other web server
```

## Configuration

### Environment Variables

Configure in `.env` file at project root:

- `JWT_SECRET`: JWT secret key (**MUST change in production**)
- `JWT_EXPIRES_IN`: Token expiration time (default 7 days)
- `CORS_ORIGIN`: CORS allowed origins (recommend setting specific domain in production)
- `DEFAULT_ADMIN_PASSWORD`: Default admin password (used on first run)

### Port Configuration

Default ports:
- Frontend: 80
- Backend API: 3000

You can modify port mapping in `docker-compose.yml`.

## Data Persistence

Data is stored in SQLite database, persisted to `./data` directory via Docker volume.

Backup data:
```bash
# Backup database file
cp ./data/app.db ./backup/app.db.$(date +%Y%m%d)
```

## Features

- ✅ User authentication (JWT)
- ✅ Account management (CRUD)
- ✅ Data persistence (SQLite)
- ✅ Docker deployment
- ✅ Separated frontend and backend
- ⚠️  Some browser-specific features removed or need reimplementation:
  - ❌ Cloudflare bypass (requires browser windows)
  - ❌ Cookie interceptor (requires browser extension APIs)
  - ⚠️  Auto-refresh needs backend scheduled tasks
  - ⚠️  WebDAV sync needs backend migration

## Development

### Backend Development

```bash
cd server
npm install
npm run dev  # Using tsx watch mode
```

### Frontend Development

```bash
cd web-app
npm install
npm run dev  # Vite dev server
```

## Migration from Browser Extension

Data from the browser extension can be migrated:

1. Export data from browser extension
2. Use migration tool to import data to new SQLite database
3. Restart services

## Security Recommendations

1. **Change default password**: Change admin password immediately after first login
2. **Change JWT_SECRET**: MUST use strong random key in production
3. **Configure CORS**: Set specific allowed domains in production
4. **Use HTTPS**: Recommend using reverse proxy (like Caddy, Traefik) for HTTPS
5. **Regular backups**: Backup database file regularly

## Production Deployment Recommendations

### HTTPS with Caddy

Create `Caddyfile`:
```
your-domain.com {
    reverse_proxy localhost:80
}
```

### HTTPS with Nginx

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

## Troubleshooting

### Connection Refused

Check if services are running:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f
```

### Database Errors

Ensure data directory has correct permissions:
```bash
chmod 755 ./data
```

### Frontend Cannot Connect to Backend

Check nginx configuration proxy settings to ensure correct backend service URL.

## License

Same open source license as the original project.

## Contributing

Issues and Pull Requests are welcome!
