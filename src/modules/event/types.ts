import { EVENT_TYPES } from "./constants"

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES]

export interface BaseEventPayload {
  eventId: string
  timestamp: string
}

export interface AppointmentConfirmedPayload extends BaseEventPayload {
  appointmentId: string
  patientId: string
  providerId: string
  appointmentTime: string
}

export interface AppointmentCancelledPayload extends BaseEventPayload {
  appointmentId: string
  reason: "PATIENT_REQUEST" | "PROVIDER_REQUEST" | "SYSTEM_CANCELLATION"
}

export interface AppointmentRescheduledPayload extends BaseEventPayload {
  appointmentId: string
  patientId: string
  providerId: string
  newAppointmentTime: string
  previousAppointmentTime: string
}

export interface ProviderScheduleUpdatedPayload extends BaseEventPayload {
  providerId: string
  weeklySchedule: {
    [key: string]: {
      start: string
      end: string
    }
  }
  appointmentDuration: number
  timezone: string
}

export interface ProviderAvailabilityCheckedPayload extends BaseEventPayload {
  providerId: string
  date: string
  availableSlots: string[]
}

export type EventPayload =
  | AppointmentConfirmedPayload
  | AppointmentCancelledPayload
  | AppointmentRescheduledPayload
  | ProviderScheduleUpdatedPayload
  | ProviderAvailabilityCheckedPayload

export interface Event {
  id: string
  type: EventType
  timestamp: string
  payload: EventPayload
}
