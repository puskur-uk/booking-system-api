import { AppointmentStatus } from "@prisma/client"

export interface AppointmentResponseDto {
  appointmentId: string
  status: AppointmentStatus
  patientId: string
  providerId: string
  startTime: string
  endTime: string
}

export interface CreateAppointmentDto {
  patientId: string
  providerId: string
  startTime: string
}

export interface RescheduleAppointmentDto {
  startTime: string
}

export interface ListAppointmentsQueryDto {
  providerId?: string
  patientId?: string
  startDate?: string
  endDate?: string
  status?: AppointmentStatus
}

export interface AppointmentConflictError extends Error {
  code: "APPOINTMENT_CONFLICT"
  startTime: string
  providerId: string
}

// Re-export AppointmentStatus for convenience
export { AppointmentStatus }
