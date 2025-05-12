import { randomUUID } from "node:crypto"
import { Injectable, Logger } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { Event, EventPayload, EventType } from "./types"

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name)

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async emitEvent(type: EventType, payload: EventPayload): Promise<void> {
    const event: Event = {
      id: randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      payload,
    }

    this.logger.log(`Event emitted: ${event.type}`)
    this.logger.debug(JSON.stringify(event))

    this.eventEmitter.emit(event.type, event)
  }
}
