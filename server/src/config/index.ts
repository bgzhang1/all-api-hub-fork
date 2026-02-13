import dotenv from "dotenv"

dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  dbPath: process.env.DB_PATH || "./data/app.db",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  nodeEnv: process.env.NODE_ENV || "development",
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",
}
