import { describe, it, expect, beforeAll } from "vitest"
import { initDatabase } from "../db/database.js"

describe("Database initialization", () => {
  beforeAll(async () => {
    process.env.DB_PATH = ":memory:"
    await initDatabase()
  })

  it("should initialize database without errors", async () => {
    expect(true).toBe(true)
  })
})
