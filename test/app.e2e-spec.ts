import { AppModule } from "@/modules/app/module"
import { PrismaService } from "@/modules/database/service"
// test/app.e2e-spec.ts
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import * as request from "supertest"
import { App } from "supertest/types"

describe("AppController (e2e)", () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        isDatabaseConnected: jest.fn().mockResolvedValue(true),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api")
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe("GET /health", () => {
    it("should return health check status", () => {
      return request(app.getHttpServer())
        .get("/api/health")
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            status: "ok",
            environment: expect.any(String),
            timestamp: expect.any(String),
            uptime: expect.any(Number),
            database: {
              connected: true,
            },
          })
        })
    })
  })
})
