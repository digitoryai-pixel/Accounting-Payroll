import EventEmitter from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { DomainEvent, DomainEventType, UUID, ISODateTime } from '../types';
import { logger } from '../utils/logger';

type EventHandler = (event: DomainEvent) => Promise<void>;

class EventBus {
  private emitter: EventEmitter;
  private handlers: Map<DomainEventType, EventHandler[]>;

  constructor() {
    this.emitter = new EventEmitter();
    this.handlers = new Map();
  }

  subscribe(eventType: DomainEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);

    this.emitter.on(eventType, async (event: DomainEvent) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error(`Error handling event ${eventType}`, {
          eventId: event.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    logger.info(`Subscribed handler to event: ${eventType}`);
  }

  async publish(
    type: DomainEventType,
    aggregateType: string,
    aggregateId: UUID,
    payload: Record<string, unknown>,
    metadata: {
      userId: UUID;
      outletId?: UUID;
      organizationId: UUID;
      correlationId?: UUID;
    }
  ): Promise<DomainEvent> {
    const event: DomainEvent = {
      id: uuidv4(),
      type,
      aggregateType,
      aggregateId,
      payload,
      metadata: {
        userId: metadata.userId,
        outletId: metadata.outletId,
        organizationId: metadata.organizationId,
        timestamp: new Date().toISOString() as ISODateTime,
        correlationId: metadata.correlationId || uuidv4(),
      },
      publishedAt: new Date().toISOString() as ISODateTime,
    };

    logger.info(`Publishing event: ${type}`, {
      eventId: event.id,
      aggregateType,
      aggregateId,
    });

    this.emitter.emit(type, event);
    return event;
  }

  getSubscriberCount(eventType: DomainEventType): number {
    return (this.handlers.get(eventType) || []).length;
  }
}

export const eventBus = new EventBus();
