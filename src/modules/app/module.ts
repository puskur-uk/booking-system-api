import { AppointmentModule } from "@/modules/appointment/module"
import { DatabaseModule } from "@/modules/database/module"
import { EventModule } from "@/modules/event/module"
import { ProviderModule } from "@/modules/provider/module"
import { Module } from "@nestjs/common"
import { AppController } from "./controller"
import { AppService } from "./service"

@Module({
  imports: [DatabaseModule, EventModule, ProviderModule, AppointmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
