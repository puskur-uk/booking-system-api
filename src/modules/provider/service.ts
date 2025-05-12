import { AvailabilityService } from "@/modules/availability/service"
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { Provider } from "@prisma/client"
import { ProviderRepository } from "./repository"
import {
  AvailabilityResponseDto,
  CreateProviderDto,
  DailySchedule,
  UpdateProviderDto,
  WeeklySchedule,
} from "./types"

@Injectable()
export class ProviderService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly availabilityService: AvailabilityService,
  ) {}

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

    if (data.weeklySchedule) {
      this.validateWeeklySchedule(data.weeklySchedule)
    }

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

    const dailySchedule = weeklySchedule[dayOfWeek] || null

    const availableSlots = await this.availabilityService.getAvailableSlots(
      providerId,
      dateObj,
      dailySchedule,
      provider.appointmentDuration,
    )

    return {
      providerId,
      date,
      availableSlots,
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

  parseWeeklySchedule(provider: Provider): WeeklySchedule {
    try {
      if (typeof provider.weeklySchedule === "object") {
        return provider.weeklySchedule as unknown as WeeklySchedule
      }

      const schedule = JSON.parse(provider.weeklySchedule as string) as WeeklySchedule
      this.validateWeeklySchedule(schedule)

      return schedule
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException("Invalid weekly schedule format")
    }
  }

  private validateWeeklySchedule(schedule: WeeklySchedule): void {
    if (!schedule || typeof schedule !== "object") {
      throw new BadRequestException("Invalid weekly schedule format")
    }

    const days = Object.entries(schedule) as [keyof WeeklySchedule, DailySchedule | null][]

    for (const [day, dailySchedule] of days) {
      if (!dailySchedule) continue

      if (!dailySchedule.start || !dailySchedule.end) {
        throw new BadRequestException(
          `Invalid schedule for ${day}: start and end times are required`,
        )
      }

      const startTime = this.parseTimeString(dailySchedule.start)
      const endTime = this.parseTimeString(dailySchedule.end)

      if (startTime >= endTime) {
        throw new BadRequestException(
          `Invalid schedule for ${day}: end time must be after start time`,
        )
      }
    }
  }

  private parseTimeString(time: string): number {
    // Validate format: HH:mm
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      throw new BadRequestException(
        `Invalid time format: ${time}. Expected format: HH:mm (24-hour format with leading zeros)`,
      )
    }

    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }
}
