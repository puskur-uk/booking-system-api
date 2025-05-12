import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { Appointment, AppointmentStatus } from "@prisma/client"
import { PrismaService } from "../database/service"

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithTransaction(data: {
    patientId: string
    providerId: string
    startTime: Date
    endTime: Date
    status: AppointmentStatus
  }): Promise<Appointment> {
    return this.prisma.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          providerId: data.providerId,
          status: { not: AppointmentStatus.CANCELLED },
          startTime: { lte: data.endTime },
          endTime: { gte: data.startTime },
        },
      })

      if (conflict) {
        throw new ConflictException("Time slot is not available")
      }

      return tx.appointment.create({
        data,
      })
    })
  }

  async rescheduleWithTransaction(
    id: string,
    data: {
      startTime: Date
      endTime: Date
    },
  ): Promise<Appointment> {
    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id },
      })

      if (!appointment) {
        throw new NotFoundException("Appointment not found")
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new ConflictException("Cannot reschedule cancelled appointment")
      }

      const conflict = await tx.appointment.findFirst({
        where: {
          providerId: appointment.providerId,
          status: { not: AppointmentStatus.CANCELLED },
          id: { not: id },
          startTime: { lte: data.endTime },
          endTime: { gte: data.startTime },
        },
      })

      if (conflict) {
        throw new ConflictException("New time slot is not available")
      }

      return tx.appointment.update({
        where: { id },
        data: {
          startTime: data.startTime,
          endTime: data.endTime,
          status: AppointmentStatus.CONFIRMED,
        },
      })
    })
  }

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
    endTime: Date,
    excludeAppointmentId?: string,
  ): Promise<Appointment | null> {
    return this.prisma.appointment.findFirst({
      where: {
        providerId,
        status: { not: AppointmentStatus.CANCELLED },
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        startTime: { lte: endTime },
        endTime: { gte: startTime },
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
