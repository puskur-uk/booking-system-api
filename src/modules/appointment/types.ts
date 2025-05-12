import { AppointmentStatus } from "@prisma/client"

// Domain types
export type AppointmentTime = string // ISO string format
export type AppointmentId = string
export type PatientId = string
export type ProviderId = string

export interface Appointment {
  id: AppointmentId
  status: AppointmentStatus
  patientId: PatientId
  providerId: ProviderId
  startTime: AppointmentTime
  endTime: AppointmentTime
}

// DTOs
export interface AppointmentResponseDto {
  appointmentId: AppointmentId
  status: AppointmentStatus
  patientId: PatientId
  providerId: ProviderId
  startTime: AppointmentTime
  endTime: AppointmentTime
}

export interface CreateAppointmentDto {
  patientId: PatientId
  providerId: ProviderId
  startTime: AppointmentTime
}

export interface RescheduleAppointmentDto {
  startTime: AppointmentTime
}

export interface ListAppointmentsQueryDto {
  providerId?: ProviderId
  patientId?: PatientId
  startDate?: AppointmentTime
  endDate?: AppointmentTime
  status?: AppointmentStatus
}

// Domain errors
export interface AppointmentConflictError extends Error {
  code: "APPOINTMENT_CONFLICT"
  startTime: AppointmentTime
  providerId: ProviderId
}

// Re-export AppointmentStatus for convenience
export { AppointmentStatus }
