import { Test, TestingModule } from "@nestjs/testing"
import { AppController } from "./controller"
import { AppService } from "./service"

describe("AppController", () => {
  let appController: AppController
  let appService: AppService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    appController = app.get<AppController>(AppController)
    appService = app.get<AppService>(AppService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("health check", () => {
    it("should return health check status", () => {
      const mockHealthCheck = {
        status: "ok",
        environment: "test",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      }

      const result = appController.healthCheck()
      expect(result).toEqual(mockHealthCheck)
    })
  })
})
