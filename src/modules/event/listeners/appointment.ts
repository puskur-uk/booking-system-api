import { Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { EVENT_TYPES } from "../constants"
import {
  AppointmentCancelledPayload,
  AppointmentConfirmedPayload,
  AppointmentRescheduledPayload,
  Event,
} from "../types"

export class AppointmentEventListener {
  private readonly logger = new Logger(AppointmentEventListener.name)

  @OnEvent(EVENT_TYPES.APPOINTMENT_CONFIRMED)
  async handleAppointmentConfirmed(event: Event) {
    const payload = event.payload as AppointmentConfirmedPayload
    this.logger.log(`Appointment confirmed: ${payload.appointmentId}`)
    this.logger.debug(JSON.stringify(event))
  }

  @OnEvent(EVENT_TYPES.APPOINTMENT_CANCELLED)
  async handleAppointmentCancelled(event: Event) {
    const payload = event.payload as AppointmentCancelledPayload
    this.logger.log(`Appointment cancelled: ${payload.appointmentId} - Reason: ${payload.reason}`)
    this.logger.debug(JSON.stringify(event))
  }

  @OnEvent(EVENT_TYPES.APPOINTMENT_RESCHEDULED)
  async handleAppointmentRescheduled(event: Event) {
    const payload = event.payload as AppointmentRescheduledPayload
    this.logger.log(
      `Appointment rescheduled: ${payload.appointmentId} - From: ${payload.previousAppointmentTime} To: ${payload.newAppointmentTime}`,
    )
    this.logger.debug(JSON.stringify(event))
  }
}
