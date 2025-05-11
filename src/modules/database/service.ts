import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

const RETRY_INTERVAL = 1000
const MAX_RETRIES = 10

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.$connect()
        console.log("✅ Connected to database")
        return
      } catch (error) {
        console.warn(`🔁 Attempt ${attempt} - Database not ready yet...`)
        await new Promise((res) => setTimeout(res, RETRY_INTERVAL))
      }
    }
    console.error(`❌ Could not connect to the database after ${MAX_RETRIES} retries.`)
    process.exit(1)
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  async isDatabaseConnected(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  }
}
