export interface TimeSlot {
  startTime: string
  endTime: string
}

export interface DailySchedule {
  start: string
  end: string
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
