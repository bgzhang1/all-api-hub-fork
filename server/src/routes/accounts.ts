import express, { Response } from "express"
import { AuthRequest } from "../middleware/auth.js"
import db from "../db/database.js"

const router = express.Router()

// Get all accounts for the authenticated user
router.get("/", (req: AuthRequest, res: Response) => {
  try {
    const accounts = db
      .prepare(
        `SELECT id, name, site_url, site_type, access_token, cookies, quota, used, income, 
                recharge_ratio, health_status, last_refresh_at, auto_refresh_enabled, tags, data,
                created_at, updated_at
         FROM accounts 
         WHERE user_id = ?
         ORDER BY created_at DESC`,
      )
      .all(req.userId)

    // Parse JSON fields
    const parsedAccounts = accounts.map((account: any) => ({
      ...account,
      tags: account.tags ? JSON.parse(account.tags) : [],
      data: account.data ? JSON.parse(account.data) : {},
      auto_refresh_enabled: Boolean(account.auto_refresh_enabled),
    }))

    res.json(parsedAccounts)
  } catch (error) {
    console.error("Get accounts error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get single account
router.get("/:id", (req: AuthRequest, res: Response) => {
  try {
    const account = db
      .prepare(
        `SELECT * FROM accounts WHERE id = ? AND user_id = ?`,
      )
      .get(req.params.id, req.userId) as any

    if (!account) {
      res.status(404).json({ error: "Account not found" })
      return
    }

    // Parse JSON fields
    const parsedAccount = {
      ...account,
      tags: account.tags ? JSON.parse(account.tags) : [],
      data: account.data ? JSON.parse(account.data) : {},
      auto_refresh_enabled: Boolean(account.auto_refresh_enabled),
    }

    res.json(parsedAccount)
  } catch (error) {
    console.error("Get account error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Create account
router.post("/", (req: AuthRequest, res: Response) => {
  try {
    const {
      id,
      name,
      siteUrl,
      siteType,
      accessToken,
      cookies,
      quota,
      used,
      income,
      rechargeRatio,
      healthStatus,
      tags,
      data,
    } = req.body

    if (!id || !name || !siteUrl || !siteType) {
      res.status(400).json({ error: "Missing required fields" })
      return
    }

    const now = Date.now()

    db.prepare(
      `INSERT INTO accounts (
        id, user_id, name, site_url, site_type, access_token, cookies,
        quota, used, income, recharge_ratio, health_status, tags, data,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      req.userId,
      name,
      siteUrl,
      siteType,
      accessToken || null,
      cookies || null,
      quota || 0,
      used || 0,
      income || 0,
      rechargeRatio || 1,
      healthStatus || "unknown",
      tags ? JSON.stringify(tags) : null,
      data ? JSON.stringify(data) : null,
      now,
      now,
    )

    res.status(201).json({ id })
  } catch (error) {
    console.error("Create account error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update account
router.put("/:id", (req: AuthRequest, res: Response) => {
  try {
    const updates: any = {}
    const allowedFields = [
      "name",
      "site_url",
      "site_type",
      "access_token",
      "cookies",
      "quota",
      "used",
      "income",
      "recharge_ratio",
      "health_status",
      "last_refresh_at",
      "auto_refresh_enabled",
      "tags",
      "data",
    ]

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        const dbField = field
        let value = req.body[field]

        if (field === "tags" || field === "data") {
          value = JSON.stringify(value)
        } else if (field === "auto_refresh_enabled") {
          value = value ? 1 : 0
        }

        updates[dbField] = value
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" })
      return
    }

    updates.updated_at = Date.now()

    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = [...Object.values(updates), req.params.id, req.userId]

    const result = db
      .prepare(
        `UPDATE accounts SET ${setClause} WHERE id = ? AND user_id = ?`,
      )
      .run(...values)

    if (result.changes === 0) {
      res.status(404).json({ error: "Account not found" })
      return
    }

    res.json({ success: true })
  } catch (error) {
    console.error("Update account error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Delete account
router.delete("/:id", (req: AuthRequest, res: Response) => {
  try {
    const result = db
      .prepare("DELETE FROM accounts WHERE id = ? AND user_id = ?")
      .run(req.params.id, req.userId)

    if (result.changes === 0) {
      res.status(404).json({ error: "Account not found" })
      return
    }

    res.json({ success: true })
  } catch (error) {
    console.error("Delete account error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get tokens for an account
router.get("/:id/tokens", (req: AuthRequest, res: Response) => {
  try {
    // Verify account belongs to user
    const account = db
      .prepare("SELECT id FROM accounts WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.userId)

    if (!account) {
      res.status(404).json({ error: "Account not found" })
      return
    }

    const tokens = db
      .prepare(
        `SELECT id, account_id, name, key, status, quota, used, data, created_at, updated_at
         FROM account_tokens 
         WHERE account_id = ?
         ORDER BY created_at DESC`,
      )
      .all(req.params.id)

    // Parse JSON fields
    const parsedTokens = tokens.map((token: any) => ({
      ...token,
      data: token.data ? JSON.parse(token.data) : {},
    }))

    res.json(parsedTokens)
  } catch (error) {
    console.error("Get tokens error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
