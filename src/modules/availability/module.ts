import { AppointmentModule } from "@/modules/appointment/module"
import { Module, forwardRef } from "@nestjs/common"
import { AvailabilityService } from "./service"

@Module({
  imports: [forwardRef(() => AppointmentModule)],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
