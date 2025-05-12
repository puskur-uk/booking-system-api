import { Injectable, NotFoundException } from "@nestjs/common"
import { Provider } from "@prisma/client"
import { ProviderRepository } from "./repository"
import {
  AvailabilityResponseDto,
  CreateProviderDto,
  DailySchedule,
  TimeSlot,
  UpdateProviderDto,
  WeeklySchedule,
} from "./types"

@Injectable()
export class ProviderService {
  constructor(private readonly providerRepository: ProviderRepository) {}

  async getAll(): Promise<Provider[]> {
    return this.providerRepository.findAll()
  }

  async getById(id: string): Promise<Provider> {
    const provider = await this.providerRepository.findById(id)
    if (!provider) throw new NotFoundException(`Provider with ID ${id} not found`)

    return provider
  }

  async create(data: CreateProviderDto): Promise<Provider> {
    return this.providerRepository.create(data)
  }

  async update(id: string, data: UpdateProviderDto): Promise<Provider> {
    await this.getById(id)

    return this.providerRepository.update(id, data)
  }

  async delete(id: string): Promise<Provider> {
    await this.getById(id)

    return this.providerRepository.delete(id)
  }

  async getAvailability(providerId: string, date: string): Promise<AvailabilityResponseDto> {
    const provider = await this.getById(providerId)
    const weeklySchedule = this.parseWeeklySchedule(provider)

    const dateObj = new Date(date)
    const dayOfWeek = this.getDayOfWeek(dateObj)

    const dailySchedule = weeklySchedule[dayOfWeek]

    if (!dailySchedule) {
      return {
        providerId,
        date,
        availableSlots: [],
      }
    }

    const availableSlots = this.generateTimeSlots(dailySchedule, provider.appointmentDuration)

    return {
      providerId,
      date,
      availableSlots: availableSlots.map((slot) => slot.startTime),
    }
  }

  private getDayOfWeek(date: Date): keyof WeeklySchedule {
    const days: Array<keyof WeeklySchedule> = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]

    return days[date.getDay()]
  }

  private generateTimeSlots(dailySchedule: DailySchedule, appointmentDuration: number): TimeSlot[] {
    const slots: TimeSlot[] = []

    const [startHour, startMinute] = dailySchedule.start.split(":").map(Number)
    const [endHour, endMinute] = dailySchedule.end.split(":").map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    for (let time = startMinutes; time < endMinutes; time += appointmentDuration) {
      if (time + appointmentDuration <= endMinutes) {
        const hour = Math.floor(time / 60)
        const minute = time % 60

        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")

        slots.push({
          startTime: `${formattedHour}:${formattedMinute}`,
          endTime: this.calculateEndTime(time, appointmentDuration),
        })
      }
    }

    return slots
  }

  private calculateEndTime(startMinutes: number, durationMinutes: number): string {
    const totalMinutes = startMinutes + durationMinutes
    const hour = Math.floor(totalMinutes / 60)
    const minute = totalMinutes % 60

    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  }

  parseWeeklySchedule(provider: Provider): WeeklySchedule {
    try {
      if (typeof provider.weeklySchedule === "object") {
        return provider.weeklySchedule as unknown as WeeklySchedule
      }

      return JSON.parse(provider.weeklySchedule as string) as WeeklySchedule
    } catch (error) {
      console.error("Error parsing weekly schedule:", error)
      return {}
    }
  }
}
