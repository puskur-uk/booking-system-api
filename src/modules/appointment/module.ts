import { Module, forwardRef } from "@nestjs/common"
import { EventModule } from "../event/module"
import { ProviderModule } from "../provider/module"
import { AppointmentController } from "./controller"
import { AppointmentRepository } from "./repository"
import { AppointmentService } from "./service"

@Module({
  imports: [forwardRef(() => ProviderModule), EventModule],
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentRepository],
  exports: [AppointmentService, AppointmentRepository],
})
export class AppointmentModule {}
