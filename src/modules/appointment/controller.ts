import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common"
import { AppointmentService } from "./service"
import {
  AppointmentResponseDto,
  CreateAppointmentDto,
  ListAppointmentsQueryDto,
  RescheduleAppointmentDto,
} from "./types"

@Controller("appointments")
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  async createAppointment(@Body() data: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    return this.appointmentService.create(data)
  }

  @Get(":id")
  async getAppointment(@Param("id") id: string): Promise<AppointmentResponseDto> {
    return this.appointmentService.getById(id)
  }

  @Put(":id")
  async rescheduleAppointment(
    @Param("id") id: string,
    @Body() data: RescheduleAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.reschedule(id, data)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelAppointment(@Param("id") id: string): Promise<void> {
    await this.appointmentService.cancel(id)
  }

  @Get()
  async listAppointments(
    @Query() query: ListAppointmentsQueryDto,
  ): Promise<AppointmentResponseDto[]> {
    return this.appointmentService.list(query)
  }
}
