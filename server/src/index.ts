import express from "express"
import cors from "cors"
import { config } from "./config/index.js"
import { initDatabase } from "./db/database.js"
import { authMiddleware } from "./middleware/auth.js"
import authRoutes from "./routes/auth.js"
import accountsRoutes from "./routes/accounts.js"

const app = express()

// Middleware
app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() })
})

// Public routes
app.use("/api/auth", authRoutes)

// Protected routes
app.use("/api/accounts", authMiddleware, accountsRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// Initialize database and start server
async function start() {
  try {
    await initDatabase()
    console.log("Database initialized")

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`)
      console.log(`Environment: ${config.nodeEnv}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

start()
