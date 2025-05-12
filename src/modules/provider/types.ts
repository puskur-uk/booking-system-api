// Domain types
export type ProviderId = string
export type TimeString = string // HH:mm format
export type Timezone = string // IANA timezone format

export interface DailySchedule {
  start: TimeString
  end: TimeString
}

export interface WeeklySchedule {
  monday?: DailySchedule | null
  tuesday?: DailySchedule | null
  wednesday?: DailySchedule | null
  thursday?: DailySchedule | null
  friday?: DailySchedule | null
  saturday?: DailySchedule | null
  sunday?: DailySchedule | null
}

export interface TimeSlot {
  startTime: TimeString
  endTime: TimeString
}

// DTOs
export interface CreateProviderDto {
  id?: ProviderId
  weeklySchedule?: WeeklySchedule
  appointmentDuration?: number // in minutes
  timezone?: Timezone
}

export interface UpdateProviderDto {
  weeklySchedule?: WeeklySchedule
  appointmentDuration?: number // in minutes
  timezone?: Timezone
}

export interface UpdateProviderScheduleDto {
  weeklySchedule: WeeklySchedule
  appointmentDuration?: number // in minutes
  timezone?: Timezone
}

export interface AvailabilityResponseDto {
  providerId: ProviderId
  date: string // YYYY-MM-DD format
  availableSlots: TimeString[]
}
