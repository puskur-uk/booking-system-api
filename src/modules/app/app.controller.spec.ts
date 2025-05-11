import { Test, TestingModule } from "@nestjs/testing"
import { PrismaService } from "../database/service"
import { AppController } from "./controller"
import { AppService } from "./service"

describe("AppController", () => {
  let appController: AppController
  let prismaService: PrismaService

  beforeEach(async () => {
    const mockPrismaService = {
      isDatabaseConnected: jest.fn().mockResolvedValue(true),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    appController = module.get<AppController>(AppController)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  describe("healthCheck", () => {
    it("should return health check status with database connected", async () => {
      const result = await appController.healthCheck()

      expect(result).toMatchObject({
        status: "ok",
        environment: expect.any(String),
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        database: {
          connected: true,
        },
      })
      expect(prismaService.isDatabaseConnected).toHaveBeenCalledTimes(1)
    })
  })
})
