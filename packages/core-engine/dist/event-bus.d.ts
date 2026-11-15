/**
 * Event Bus implementation for Core Engine
 * Provides typed event emission and subscription
 */
import type { CoreEvent, CoreEventListener } from './types.js';
/**
 * Typed event bus for the core engine
 */
export declare class EventBus {
    private emitter;
    constructor();
    on<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this;
    off<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this;
    emit<E extends CoreEvent>(event: E, ...args: any[]): boolean;
    once<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this;
    removeAllListeners(event?: CoreEvent): this;
    /**
     * Get listener count for an event
     */
    listenerCount(event: CoreEvent): number;
    /**
     * Get all event names that have listeners
     */
    eventNames(): CoreEvent[];
}
/**
 * Create a child event bus with a prefix
 */
export declare function createChildEventBus(parent: EventBus, prefix: string): EventBus;
//# sourceMappingURL=event-bus.d.ts.map