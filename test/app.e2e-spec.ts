import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import * as request from "supertest"
import { App } from "supertest/types"
import { AppModule } from "../src/modules/app/module"

describe("AppController (e2e)", () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
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
          expect(res.body).toEqual({
            status: "ok",
            environment: "test",
            timestamp: expect.any(String),
            uptime: expect.any(Number),
          })
        })
    })
  })
})
