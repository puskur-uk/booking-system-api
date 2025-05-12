import { EventEmitter2 } from "@nestjs/event-emitter"
import { Test, TestingModule } from "@nestjs/testing"
import { EVENT_TYPES } from "./constants"
import { EventService } from "./service"
import { AppointmentConfirmedPayload } from "./types"

describe("EventService", () => {
  let service: EventService
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<EventService>(EventService)
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("emitEvent", () => {
    it("should emit an appointment confirmed event", async () => {
      const payload: AppointmentConfirmedPayload = {
        eventId: "test-event-id",
        timestamp: new Date().toISOString(),
        appointmentId: "test-appointment-id",
        patientId: "test-patient-id",
        providerId: "test-provider-id",
        appointmentTime: new Date().toISOString(),
      }

      await service.emitEvent(EVENT_TYPES.APPOINTMENT_CONFIRMED, payload)

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EVENT_TYPES.APPOINTMENT_CONFIRMED,
        expect.objectContaining({
          type: EVENT_TYPES.APPOINTMENT_CONFIRMED,
          payload,
        }),
      )
    })
  })
})
