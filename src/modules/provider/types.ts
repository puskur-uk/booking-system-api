export interface WeeklySchedule {
  monday?: DailySchedule | null
  tuesday?: DailySchedule | null
  wednesday?: DailySchedule | null
  thursday?: DailySchedule | null
  friday?: DailySchedule | null
  saturday?: DailySchedule | null
  sunday?: DailySchedule | null
}

export interface DailySchedule {
  start: string
  end: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
}

export interface CreateProviderDto {
  id?: string
  weeklySchedule?: WeeklySchedule
  appointmentDuration?: number
  timezone?: string
}

export interface UpdateProviderDto {
  weeklySchedule?: WeeklySchedule
  appointmentDuration?: number
  timezone?: string
}

export interface AvailabilityResponseDto {
  providerId: string
  date: string
  availableSlots: string[]
}
