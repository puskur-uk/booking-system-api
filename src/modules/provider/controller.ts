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
import { Provider } from "@prisma/client"
import { ProviderService } from "./service"
import { AvailabilityResponseDto, CreateProviderDto, UpdateProviderDto, UpdateProviderScheduleDto } from "./types"

@Controller("providers")
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get()
  async getAllProviders(): Promise<Provider[]> {
    return this.providerService.getAll()
  }

  @Get(":id")
  async getProvider(@Param("id") id: string): Promise<Provider> {
    return this.providerService.getById(id)
  }

  @Post()
  async createProvider(@Body() data: CreateProviderDto): Promise<Provider> {
    return this.providerService.create(data)
  }

  @Put(":id")
  async updateProvider(
    @Param("id") id: string,
    @Body() data: UpdateProviderDto,
  ): Promise<Provider> {
    return this.providerService.update(id, data)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProvider(@Param("id") id: string): Promise<void> {
    await this.providerService.delete(id)
  }

  @Get(":id/availability")
  async getAvailability(
    @Param("id") id: string,
    @Query("date") date: string,
  ): Promise<AvailabilityResponseDto> {
    return this.providerService.getAvailability(id, date)
  }

  @Post(":id/schedule")
  async updateProviderSchedule(
    @Param("id") id: string,
    @Body() data: UpdateProviderScheduleDto,
  ): Promise<Provider> {
    return this.providerService.update(id, data)
  }
}

