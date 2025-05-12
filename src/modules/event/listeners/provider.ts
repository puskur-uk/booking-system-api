import { Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { EVENT_TYPES } from "../constants"
import { Event, ProviderAvailabilityCheckedPayload, ProviderScheduleUpdatedPayload } from "../types"

export class ProviderEventListener {
  private readonly logger = new Logger(ProviderEventListener.name)

  @OnEvent(EVENT_TYPES.PROVIDER_SCHEDULE_UPDATED)
  async handleScheduleUpdated(event: Event) {
    const payload = event.payload as ProviderScheduleUpdatedPayload
    this.logger.log(`Provider schedule updated: ${payload.providerId}`)
    this.logger.debug(JSON.stringify(event))
  }

  @OnEvent(EVENT_TYPES.PROVIDER_AVAILABILITY_CHECKED)
  async handleAvailabilityChecked(event: Event) {
    const payload = event.payload as ProviderAvailabilityCheckedPayload
    this.logger.log(
      `Provider availability checked: ${payload.providerId} for date ${payload.date} - Found ${payload.availableSlots.length} slots`,
    )
    this.logger.debug(JSON.stringify(event))
  }
}
