import { Injectable, NotFoundException } from "@nestjs/common"
import { Provider } from "@prisma/client"
import { ProviderRepository } from "./repository"
import {
  AvailabilityResponseDto,
  CreateProviderDto,
  UpdateProviderDto,
  WeeklySchedule,
} from "./types"
import { AvailabilityService } from "@/modules/availability/service"

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

      return JSON.parse(provider.weeklySchedule as string) as WeeklySchedule
    } catch (error) {
      console.error("Error parsing weekly schedule:", error)
      return {}
    }
  }
}
