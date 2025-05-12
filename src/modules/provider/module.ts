import { Module, forwardRef } from "@nestjs/common"
import { AppointmentModule } from "../appointment/module"
import { AvailabilityModule } from "../availability/module"
import { ProviderController } from "./controller"
import { ProviderRepository } from "./repository"
import { ProviderService } from "./service"

@Module({
  imports: [forwardRef(() => AppointmentModule), AvailabilityModule],
  controllers: [ProviderController],
  providers: [ProviderService, ProviderRepository],
  exports: [ProviderService],
})
export class ProviderModule {}
