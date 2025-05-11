import { PrismaService } from "@/modules/database/service"
import { Injectable } from "@nestjs/common"

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async healthCheck() {
    return {
      status: "ok",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: await this.prisma.isDatabaseConnected(),
      },
    }
  }
}
