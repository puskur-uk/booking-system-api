import { Module } from "@nestjs/common"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { AppointmentEventListener } from "./listeners/appointment"
import { ProviderEventListener } from "./listeners/provider"
import { EventService } from "./service"

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ".",
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],
  providers: [EventService, AppointmentEventListener, ProviderEventListener],
  exports: [EventService],
})
export class EventModule {}
