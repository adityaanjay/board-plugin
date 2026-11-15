"use strict";
/**
 * Event Bus implementation for Core Engine
 * Provides typed event emission and subscription
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
exports.createChildEventBus = createChildEventBus;
const eventemitter3_1 = require("eventemitter3");
/**
 * Typed event bus for the core engine
 */
class EventBus {
    emitter;
    constructor() {
        this.emitter = new eventemitter3_1.EventEmitter();
    }
    on(event, listener) {
        this.emitter.on(event, listener);
        return this;
    }
    off(event, listener) {
        this.emitter.off(event, listener);
        return this;
    }
    emit(event, ...args) {
        return this.emitter.emit(event, ...args);
    }
    once(event, listener) {
        this.emitter.once(event, listener);
        return this;
    }
    removeAllListeners(event) {
        this.emitter.removeAllListeners(event);
        return this;
    }
    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        return this.emitter.listenerCount(event);
    }
    /**
     * Get all event names that have listeners
     */
    eventNames() {
        return this.emitter.eventNames();
    }
}
exports.EventBus = EventBus;
/**
 * Create a child event bus with a prefix
 */
function createChildEventBus(parent, prefix) {
    const child = new EventBus();
    // Forward events from child to parent with prefix
    // Note: This is a simplified version that may not perfectly preserve types
    // In practice, you'd want to handle each event type specifically
    const events = parent.eventNames();
    for (const eventName of events) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parent.on(eventName, (...args) => {
            child.emit(`${prefix}:${eventName}`, ...args);
        });
    }
    return child;
}
//# sourceMappingURL=event-bus.js.map