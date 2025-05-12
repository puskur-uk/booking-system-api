import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { Appointment, AppointmentStatus } from "@prisma/client"
import { EventService } from "../event/service"
import {
  AppointmentCancelledPayload,
  AppointmentConfirmedPayload,
  AppointmentRescheduledPayload,
  BaseEventPayload,
} from "../event/types"
import { ProviderService } from "@/modules/provider/service"
import { AppointmentRepository } from "./repository"
import {
  AppointmentResponseDto,
  CreateAppointmentDto,
  ListAppointmentsQueryDto,
  RescheduleAppointmentDto,
} from "./types"

export const EVENT_TYPES = {
  APPOINTMENT_CONFIRMED: "APPOINTMENT_CONFIRMED",
  APPOINTMENT_RESCHEDULED: "APPOINTMENT_RESCHEDULED",
  APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
} as const

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly providerService: ProviderService,
    private readonly eventService: EventService,
  ) {}

  private mapToResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      appointmentId: appointment.id,
      status: appointment.status,
      patientId: appointment.patientId,
      providerId: appointment.providerId,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
    }
  }

  private createEventPayload<T extends BaseEventPayload>(data: Omit<T, keyof BaseEventPayload>): T {
    return {
      ...data,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    } as T
  }

  async create(data: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const provider = await this.providerService.getById(data.providerId)
    if (!provider) {
      throw new NotFoundException("Provider not found")
    }

    const startTime = new Date(data.startTime)
    const conflict = await this.appointmentRepository.findConflict(data.providerId, startTime)
    if (conflict) {
      throw new ConflictException("Time slot is not available")
    }

    const endTime = new Date(startTime.getTime() + provider.appointmentDuration * 60000)

    const appointment = await this.appointmentRepository.create({
      patientId: data.patientId,
      providerId: data.providerId,
      startTime,
      endTime,
      status: AppointmentStatus.CONFIRMED,
    })

    await this.eventService.emitEvent(
      EVENT_TYPES.APPOINTMENT_CONFIRMED,
      this.createEventPayload<AppointmentConfirmedPayload>({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        providerId: appointment.providerId,
        appointmentTime: appointment.startTime.toISOString(),
      }),
    )

    return this.mapToResponseDto(appointment)
  }

  async reschedule(id: string, data: RescheduleAppointmentDto): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findById(id)
    if (!appointment) {
      throw new NotFoundException("Appointment not found")
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new ConflictException("Cannot reschedule cancelled appointment")
    }

    const newStartTime = new Date(data.startTime)
    const conflict = await this.appointmentRepository.findConflict(
      appointment.providerId,
      newStartTime,
      appointment.id,
    )
    if (conflict) {
      throw new ConflictException("New time slot is not available")
    }

    const provider = await this.providerService.getById(appointment.providerId)
    const newEndTime = new Date(newStartTime.getTime() + provider.appointmentDuration * 60000)

    const previousAppointmentTime = appointment.startTime.toISOString()

    const updatedAppointment = await this.appointmentRepository.update(id, {
      startTime: newStartTime,
      endTime: newEndTime,
      status: AppointmentStatus.CONFIRMED,
    })

    await this.eventService.emitEvent(
      EVENT_TYPES.APPOINTMENT_RESCHEDULED,
      this.createEventPayload<AppointmentRescheduledPayload>({
        appointmentId: updatedAppointment.id,
        patientId: updatedAppointment.patientId,
        providerId: updatedAppointment.providerId,
        newAppointmentTime: updatedAppointment.startTime.toISOString(),
        previousAppointmentTime,
      }),
    )

    return this.mapToResponseDto(updatedAppointment)
  }

  async cancel(id: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(id)
    if (!appointment) {
      throw new NotFoundException("Appointment not found")
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new ConflictException("Appointment is already cancelled")
    }

    await this.appointmentRepository.update(id, {
      status: AppointmentStatus.CANCELLED,
    })

    await this.eventService.emitEvent(
      EVENT_TYPES.APPOINTMENT_CANCELLED,
      this.createEventPayload<AppointmentCancelledPayload>({
        appointmentId: appointment.id,
        reason: "PATIENT_REQUEST",
      }),
    )
  }

  async getById(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findById(id)
    if (!appointment) {
      throw new NotFoundException("Appointment not found")
    }
    return this.mapToResponseDto(appointment)
  }

  async list(query: ListAppointmentsQueryDto): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentRepository.list({
      providerId: query.providerId,
      patientId: query.patientId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      status: query.status,
    })

    return appointments.map(this.mapToResponseDto)
  }
}
