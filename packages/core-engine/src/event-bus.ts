/**
 * Event Bus implementation for Core Engine
 * Provides typed event emission and subscription
 */

import { EventEmitter } from 'eventemitter3';
import type { CoreEvent, CoreEventListener } from './types.js';

/**
 * Typed event bus for the core engine
 */
export class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  on<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this {
    this.emitter.on(event, listener);
    return this;
  }

  off<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this {
    this.emitter.off(event, listener);
    return this;
  }

  emit<E extends CoreEvent>(event: E, ...args: any[]): boolean {
    return this.emitter.emit(event, ...args);
  }

  once<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this {
    this.emitter.once(event, listener);
    return this;
  }

  removeAllListeners(event?: CoreEvent): this {
    this.emitter.removeAllListeners(event);
    return this;
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: CoreEvent): number {
    return this.emitter.listenerCount(event);
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): CoreEvent[] {
    return this.emitter.eventNames() as CoreEvent[];
  }
}

/**
 * Create a child event bus with a prefix
 */
export function createChildEventBus(parent: EventBus, prefix: string): EventBus {
  const child = new EventBus();

  // Forward events from child to parent with prefix
  // Note: This is a simplified version that may not perfectly preserve types
  // In practice, you'd want to handle each event type specifically
  const events = parent.eventNames();
  for (const eventName of events) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parent.on(eventName, (...args: any[]) => {
      child.emit(`${prefix}:${eventName}` as CoreEvent, ...args);
    });
  }

  return child;
}