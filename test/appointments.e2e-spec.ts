import { AppModule } from "@/modules/app/module"
import { PrismaService } from "@/modules/database/service"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { AppointmentStatus } from "@prisma/client"
import * as request from "supertest"

jest.setTimeout(60000)

describe("Appointment API (e2e)", () => {
  let app: INestApplication
  let prisma: PrismaService
  const providerId = "123e4567-e89b-12d3-a456-426614174000"
  const patientId = "987fcdeb-51a2-43d8-b4c5-9876543210ab"
  const patientId2 = "987fcdeb-51a2-43d8-b4c5-9876543210ac"
  let createdAppointmentId: string
  let transactionTestAppointmentId: string

  const getFormattedTime = (days: number, hours: number, minutes: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    date.setHours(hours, minutes, 0, 0)
    return date.toISOString()
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api")
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()
    await cleanup()
  })

  afterAll(async () => {
    await cleanup()
    await app.close()
  })

  async function cleanup() {
    if (createdAppointmentId) {
      try {
        await prisma.appointment.delete({ where: { id: createdAppointmentId } })
      } catch (e) {
        // Ignore if already deleted
      }
    }

    if (transactionTestAppointmentId) {
      try {
        await prisma.appointment.delete({ where: { id: transactionTestAppointmentId } })
      } catch (e) {
        // Ignore if already deleted
      }
    }

    try {
      await prisma.provider.deleteMany({ where: { id: providerId } })
    } catch (e) {
      // Ignore if already deleted
    }

    try {
      await prisma.appointment.deleteMany({
        where: {
          OR: [{ patientId: patientId }, { patientId: patientId2 }],
        },
      })
    } catch (e) {
      // Ignore errors
    }
  }

  it("1. Create a provider first", async () => {
    await cleanup()

    const response = await request(app.getHttpServer())
      .post("/api/providers")
      .send({
        id: providerId,
        weeklySchedule: {
          monday: { start: "09:00", end: "17:00" },
          tuesday: { start: "09:00", end: "17:00" },
          wednesday: { start: "09:00", end: "17:00" },
          thursday: { start: "09:00", end: "17:00" },
          friday: { start: "09:00", end: "17:00" },
        },
        appointmentDuration: 30,
        timezone: "UTC",
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id", providerId)
  })

  it("2. Create a new appointment", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/appointments")
      .send({
        providerId: providerId,
        patientId: patientId,
        startTime: getFormattedTime(1, 10, 0),
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("appointmentId")
    expect(response.body).toHaveProperty("status", "CONFIRMED")
    createdAppointmentId = response.body.appointmentId
  })

  it("3. Get the created appointment using its ID", async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/appointments/${createdAppointmentId}`,
    )

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("appointmentId", createdAppointmentId)
  })

  it("4. List all appointments for next 7 days", async () => {
    const startDate = formatDate(new Date())
    const endDate = formatDate(addDays(new Date(), 7))

    const response = await request(app.getHttpServer()).get(
      `/api/appointments?providerId=${providerId}&startDate=${startDate}&endDate=${endDate}`,
    )

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThan(0)
  })

  it("5. Reschedule the created appointment", async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/appointments/${createdAppointmentId}`)
      .send({
        startTime: getFormattedTime(2, 14, 0),
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("appointmentId", createdAppointmentId)
  })

  it("6. Verify rescheduled appointment", async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/appointments/${createdAppointmentId}`,
    )

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("appointmentId", createdAppointmentId)
    const appointmentDate = new Date(response.body.startTime)
    expect(appointmentDate.getHours()).toBe(14)
  })

  it("7. Cancel the appointment", async () => {
    const response = await request(app.getHttpServer()).delete(
      `/api/appointments/${createdAppointmentId}`,
    )

    expect(response.status).toBe(204)
  })

  it("8. Verify appointment is cancelled", async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/appointments/${createdAppointmentId}`,
    )

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("appointmentId", createdAppointmentId)
    expect(response.body).toHaveProperty("status", "CANCELLED")
  })

  it("9. Error Cases - Create appointment with non-existent provider", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/appointments")
      .send({
        providerId: "non-existent-provider",
        patientId: patientId,
        startTime: getFormattedTime(1, 11, 0),
      })

    expect(response.status).toBe(404)
  })

  it("10. Error Cases - Try to reschedule a cancelled appointment", async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/appointments/${createdAppointmentId}`)
      .send({
        startTime: getFormattedTime(3, 15, 0),
      })

    expect(response.status).toBe(409)
  })

  it("11. Error Cases - Try to cancel an already cancelled appointment", async () => {
    const response = await request(app.getHttpServer()).delete(
      `/api/appointments/${createdAppointmentId}`,
    )

    expect(response.status).toBe(409)
  })

  it("12. List appointments with specific filters", async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/appointments?providerId=${providerId}&patientId=${patientId}&status=CANCELLED`,
    )

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  it("13. Error Cases - Get a non-existent appointment", async () => {
    const response = await request(app.getHttpServer()).get("/api/appointments/non-existent-id")

    expect(response.status).toBe(404)
  })

  it("14. Update provider schedule", async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/providers/${providerId}/schedule`)
      .send({
        weeklySchedule: {
          monday: { start: "10:00", end: "18:00" },
          tuesday: { start: "10:00", end: "18:00" },
          wednesday: { start: "10:00", end: "18:00" },
          thursday: { start: "10:00", end: "18:00" },
          friday: { start: "10:00", end: "18:00" },
        },
        appointmentDuration: 45,
        timezone: "America/New_York",
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id", providerId)
    expect(response.body).toHaveProperty("appointmentDuration", 45)
    expect(response.body).toHaveProperty("timezone", "America/New_York")
  })

  it("15. Verify updated schedule", async () => {
    const response = await request(app.getHttpServer()).get(`/api/providers/${providerId}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id", providerId)
    expect(response.body).toHaveProperty("appointmentDuration", 45)
  })

  it("16. Error Cases - Update schedule for non-existent provider", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/providers/non-existent-id/schedule")
      .send({
        weeklySchedule: {
          monday: { start: "09:00", end: "17:00" },
        },
      })

    expect(response.status).toBe(404)
  })

  it("17. Error Cases - Update schedule with invalid time format", async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/providers/${providerId}/schedule`)
      .send({
        weeklySchedule: {
          monday: { start: "25:00", end: "17:00" },
        },
      })

    expect(response.status).toBe(400)
  })

  it("18. Error Cases - Update schedule with end time before start time", async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/providers/${providerId}/schedule`)
      .send({
        weeklySchedule: {
          monday: { start: "17:00", end: "09:00" },
        },
      })

    expect(response.status).toBe(400)
  })

  it("19. Error Cases - Update schedule with missing leading zero", async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/providers/${providerId}/schedule`)
      .send({
        weeklySchedule: {
          monday: { start: "9:00", end: "17:00" },
        },
      })

    expect(response.status).toBe(400)
  })

  it("20. Transaction Tests - Create first appointment successfully", async () => {
    await cleanup()
    await request(app.getHttpServer())
      .post("/api/providers")
      .send({
        id: providerId,
        weeklySchedule: {
          monday: { start: "09:00", end: "17:00" },
          tuesday: { start: "09:00", end: "17:00" },
          wednesday: { start: "09:00", end: "17:00" },
          thursday: { start: "09:00", end: "17:00" },
          friday: { start: "09:00", end: "17:00" },
        },
        appointmentDuration: 30,
        timezone: "UTC",
      })

    const response = await request(app.getHttpServer())
      .post("/api/appointments")
      .send({
        providerId: providerId,
        patientId: patientId,
        startTime: getFormattedTime(1, 13, 0),
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("appointmentId")
    expect(response.body).toHaveProperty("status", "CONFIRMED")
    transactionTestAppointmentId = response.body.appointmentId
  })

  it("21. Transaction Tests - Try to create overlapping appointment", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/appointments")
      .send({
        providerId: providerId,
        patientId: patientId2,
        startTime: getFormattedTime(1, 13, 15),
      })

    expect(response.status).toBe(409)
  })

  it("22. Transaction Tests - Create appointment with partial overlap", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/appointments")
      .send({
        providerId: providerId,
        patientId: patientId2,
        startTime: getFormattedTime(1, 12, 45),
      })

    expect(response.status).toBe(409)
  })

  it("23. Transaction Tests - Create appointment with exact overlap", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/appointments")
      .send({
        providerId: providerId,
        patientId: patientId2,
        startTime: getFormattedTime(1, 13, 0),
      })

    expect(response.status).toBe(409)
  })

  it("24. Transaction Tests - Non-overlapping appointment should be allowed", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/appointments")
      .send({
        providerId: providerId,
        patientId: patientId2,
        startTime: getFormattedTime(1, 13, 45),
      })

    expect(response.status).toBe(201)
  })

  it("25. Transaction Tests - Back-to-back appointment should be rejected", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/appointments")
      .send({
        providerId: providerId,
        patientId: patientId2,
        startTime: getFormattedTime(1, 13, 30),
      })

    expect(response.status).toBe(409)
  })

  it("Cancel transaction test appointment", async () => {
    const response = await request(app.getHttpServer()).delete(
      `/api/appointments/${transactionTestAppointmentId}`,
    )

    expect(response.status).toBe(204)
  })

  it("26. Transaction Tests - Create valid appointment after cancelled one", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/appointments")
      .send({
        providerId: providerId,
        patientId: patientId2,
        startTime: getFormattedTime(1, 13, 0),
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("appointmentId")
    expect(response.body).toHaveProperty("status", "CONFIRMED")
  })
})
