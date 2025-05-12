import { Injectable } from "@nestjs/common"
import { Appointment, AppointmentStatus } from "@prisma/client"
import { PrismaService } from "../database/service"

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    patientId: string
    providerId: string
    startTime: Date
    endTime: Date
    status: AppointmentStatus
  }): Promise<Appointment> {
    return this.prisma.appointment.create({
      data,
    })
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.prisma.appointment.findUnique({
      where: { id },
    })
  }

  async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data,
    })
  }

  async findConflict(
    providerId: string,
    startTime: Date,
    excludeAppointmentId?: string,
  ): Promise<Appointment | null> {
    return this.prisma.appointment.findFirst({
      where: {
        providerId,
        status: { not: AppointmentStatus.CANCELLED },
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
        ],
      },
    })
  }

  async list(query: {
    providerId?: string
    patientId?: string
    startDate?: Date
    endDate?: Date
    status?: AppointmentStatus
  }): Promise<Appointment[]> {
    const { providerId, patientId, startDate, endDate, status } = query

    return this.prisma.appointment.findMany({
      where: {
        providerId: providerId,
        patientId: patientId,
        status: status,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    })
  }
}
