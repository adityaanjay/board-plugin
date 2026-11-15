"use strict";
/**
 * Core Engine - Board Plugin Core
 *
 * Main entry point for the Board Plugin core engine.
 * Provides plugin lifecycle management, event bus, and module registry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoreEngine = exports.CoreEngine = exports.ModuleRegistry = exports.createChildEventBus = exports.EventBus = void 0;
// Re-export implementations
var event_bus_js_1 = require("./event-bus.js");
Object.defineProperty(exports, "EventBus", { enumerable: true, get: function () { return event_bus_js_1.EventBus; } });
Object.defineProperty(exports, "createChildEventBus", { enumerable: true, get: function () { return event_bus_js_1.createChildEventBus; } });
var module_registry_js_1 = require("./module-registry.js");
Object.defineProperty(exports, "ModuleRegistry", { enumerable: true, get: function () { return module_registry_js_1.ModuleRegistry; } });
var core_engine_js_1 = require("./core-engine.js");
Object.defineProperty(exports, "CoreEngine", { enumerable: true, get: function () { return core_engine_js_1.CoreEngine; } });
Object.defineProperty(exports, "createCoreEngine", { enumerable: true, get: function () { return core_engine_js_1.createCoreEngine; } });
//# sourceMappingURL=index.js.map