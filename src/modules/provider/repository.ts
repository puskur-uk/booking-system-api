import { PrismaService } from "@/modules/database/service"
import { Injectable } from "@nestjs/common"
import { Prisma, Provider } from "@prisma/client"
import { CreateProviderDto, UpdateProviderDto } from "./types"

@Injectable()
export class ProviderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Provider[]> {
    return this.prisma.provider.findMany()
  }

  async findById(id: string): Promise<Provider | null> {
    return this.prisma.provider.findUnique({
      where: { id },
    })
  }

  async create(data: CreateProviderDto): Promise<Provider> {
    return this.prisma.provider.create({
      data: {
        id: data.id || undefined,
        weeklySchedule: data.weeklySchedule ? JSON.parse(JSON.stringify(data.weeklySchedule)) : {},
        appointmentDuration: data.appointmentDuration || 30,
        timezone: data.timezone || "UTC",
      },
    })
  }

  async update(id: string, data: UpdateProviderDto): Promise<Provider> {
    const updateData: Prisma.ProviderUpdateInput = {}

    if (data.weeklySchedule) {
      updateData.weeklySchedule = JSON.parse(JSON.stringify(data.weeklySchedule))
    }

    if (data.appointmentDuration) {
      updateData.appointmentDuration = data.appointmentDuration
    }

    if (data.timezone) {
      updateData.timezone = data.timezone
    }

    return this.prisma.provider.update({
      where: { id },
      data: updateData,
    })
  }

  async delete(id: string): Promise<Provider> {
    return this.prisma.provider.delete({
      where: { id },
    })
  }
}
