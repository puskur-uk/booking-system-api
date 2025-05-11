import { Injectable } from "@nestjs/common"

@Injectable()
export class AppService {
  healthCheck() {
    return {
      status: "ok",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }
}
