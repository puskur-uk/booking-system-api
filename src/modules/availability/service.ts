import { AppointmentRepository } from "@/modules/appointment/repository"
import { Inject, Injectable, forwardRef } from "@nestjs/common"
import { AppointmentStatus } from "@prisma/client"
import { DailySchedule, TimeSlot } from "./types"

@Injectable()
export class AvailabilityService {
  constructor(
    @Inject(forwardRef(() => AppointmentRepository))
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async getAvailableSlots(
    providerId: string,
    date: Date,
    dailySchedule: DailySchedule | null,
    appointmentDuration: number,
  ): Promise<string[]> {
    if (!dailySchedule) {
      return []
    }

    const potentialSlots = this.generateSlots(dailySchedule, appointmentDuration)
    const bookedSlots = await this.getBookedSlots(providerId, date)

    return this.findAvailableSlots(potentialSlots, bookedSlots, date)
  }

  private async getBookedSlots(providerId: string, date: Date): Promise<TimeSlot[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const appointments = await this.appointmentRepository.list({
      providerId,
      startDate: startOfDay,
      endDate: endOfDay,
      status: AppointmentStatus.CONFIRMED,
    })

    return appointments.map((appointment) => ({
      startTime: this.formatTime(appointment.startTime),
      endTime: this.formatTime(appointment.endTime),
    }))
  }

  private findAvailableSlots(
    potentialSlots: TimeSlot[],
    bookedSlots: TimeSlot[],
    date: Date,
  ): string[] {
    return potentialSlots
      .filter((slot) => !this.isSlotBooked(slot, bookedSlots, date))
      .map((slot) => slot.startTime)
  }

  private isSlotBooked(slot: TimeSlot, bookedSlots: TimeSlot[], date: Date): boolean {
    const slotStart = this.combineDateAndTime(date, slot.startTime)
    const slotEnd = this.combineDateAndTime(date, slot.endTime)

    return bookedSlots.some((bookedSlot) => {
      const bookedStart = this.combineDateAndTime(date, bookedSlot.startTime)
      const bookedEnd = this.combineDateAndTime(date, bookedSlot.endTime)
      return bookedStart < slotEnd && bookedEnd > slotStart
    })
  }

  private generateSlots(schedule: DailySchedule, duration: number): TimeSlot[] {
    const slots: TimeSlot[] = []
    const [startHour, startMinute] = schedule.start.split(":").map(Number)
    const [endHour, endMinute] = schedule.end.split(":").map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    for (let time = startMinutes; time < endMinutes; time += duration) {
      if (time + duration <= endMinutes) {
        slots.push(this.createTimeSlot(time, duration))
      }
    }

    return slots
  }

  private createTimeSlot(startMinutes: number, duration: number): TimeSlot {
    const startHour = Math.floor(startMinutes / 60)
    const startMinute = startMinutes % 60
    const endMinutes = startMinutes + duration
    const endHour = Math.floor(endMinutes / 60)
    const endMinute = endMinutes % 60

    return {
      startTime: `${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`,
      endTime: `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`,
    }
  }

  private combineDateAndTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const result = new Date(date)
    result.setHours(hours, minutes, 0, 0)
    return result
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
  }
}
