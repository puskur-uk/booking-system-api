import { Test, TestingModule } from "@nestjs/testing"
import { EVENT_TYPES } from "../constants"
import { Event } from "../types"
import { AppointmentEventListener } from "./appointment"

describe("AppointmentEventListener", () => {
  let listener: AppointmentEventListener

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentEventListener],
    }).compile()

    listener = module.get<AppointmentEventListener>(AppointmentEventListener)
  })

  it("should be defined", () => {
    expect(listener).toBeDefined()
  })

  describe("handleAppointmentConfirmed", () => {
    it("should handle appointment confirmed event", async () => {
      const event: Event = {
        id: "test-event-id",
        type: EVENT_TYPES.APPOINTMENT_CONFIRMED,
        timestamp: new Date().toISOString(),
        payload: {
          eventId: "test-event-id",
          timestamp: new Date().toISOString(),
          appointmentId: "test-appointment-id",
          patientId: "test-patient-id",
          providerId: "test-provider-id",
          appointmentTime: new Date().toISOString(),
        },
      }

      await expect(listener.handleAppointmentConfirmed(event)).resolves.not.toThrow()
    })
  })

  describe("handleAppointmentCancelled", () => {
    it("should handle appointment cancelled event", async () => {
      const event: Event = {
        id: "test-event-id",
        type: EVENT_TYPES.APPOINTMENT_CANCELLED,
        timestamp: new Date().toISOString(),
        payload: {
          eventId: "test-event-id",
          timestamp: new Date().toISOString(),
          appointmentId: "test-appointment-id",
          reason: "PATIENT_REQUEST",
        },
      }

      await expect(listener.handleAppointmentCancelled(event)).resolves.not.toThrow()
    })
  })

  describe("handleAppointmentRescheduled", () => {
    it("should handle appointment rescheduled event", async () => {
      const event: Event = {
        id: "test-event-id",
        type: EVENT_TYPES.APPOINTMENT_RESCHEDULED,
        timestamp: new Date().toISOString(),
        payload: {
          eventId: "test-event-id",
          timestamp: new Date().toISOString(),
          appointmentId: "test-appointment-id",
          patientId: "test-patient-id",
          providerId: "test-provider-id",
          newAppointmentTime: new Date().toISOString(),
          previousAppointmentTime: new Date().toISOString(),
        },
      }

      await expect(listener.handleAppointmentRescheduled(event)).resolves.not.toThrow()
    })
  })
})
