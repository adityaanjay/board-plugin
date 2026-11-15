"use strict";
/**
 * Serial Communication Module
 * Provides serial port management, data streaming, and monitoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MONITOR_CONFIG = exports.DEFAULT_SERIAL_CONFIG = exports.createSerialManager = exports.SerialManager = void 0;
var serial_manager_js_1 = require("./serial-manager.js");
Object.defineProperty(exports, "SerialManager", { enumerable: true, get: function () { return serial_manager_js_1.SerialManager; } });
Object.defineProperty(exports, "createSerialManager", { enumerable: true, get: function () { return serial_manager_js_1.createSerialManager; } });
var types_js_1 = require("./types.js");
Object.defineProperty(exports, "DEFAULT_SERIAL_CONFIG", { enumerable: true, get: function () { return types_js_1.DEFAULT_SERIAL_CONFIG; } });
Object.defineProperty(exports, "DEFAULT_MONITOR_CONFIG", { enumerable: true, get: function () { return types_js_1.DEFAULT_MONITOR_CONFIG; } });
//# sourceMappingURL=index.js.map