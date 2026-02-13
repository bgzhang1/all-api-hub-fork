import express, { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../db/database.js"
import { config } from "../config/index.js"

const router = express.Router()

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" })
      return
    }

    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as {
      id: number
      username: string
      password_hash: string
    } | undefined

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    })

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" })
      return
    }

    // Check if user already exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username)
    if (existingUser) {
      res.status(400).json({ error: "Username already exists" })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const now = Date.now()

    const result = db
      .prepare(
        "INSERT INTO users (username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)",
      )
      .run(username, passwordHash, now, now)

    const token = jwt.sign({ userId: result.lastInsertRowid }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    })

    res.json({
      token,
      user: {
        id: result.lastInsertRowid,
        username,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
