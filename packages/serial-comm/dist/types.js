"use strict";
/**
 * Serial Communication type definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MONITOR_CONFIG = exports.DEFAULT_SERIAL_CONFIG = void 0;
/**
 * Default serial port configuration
 */
exports.DEFAULT_SERIAL_CONFIG = {
    path: '',
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    rtscts: false,
    xon: false,
    xoff: false,
    xany: false,
    hupcl: true,
    lock: true,
    autoOpen: false,
    highWaterMark: 65536,
    encoding: 'utf8',
};
/**
 * Default serial monitor configuration
 */
exports.DEFAULT_MONITOR_CONFIG = {
    port: '',
    baudRate: 115200,
    timestamps: true,
    showDirection: true,
    maxBufferSize: 65536,
    encoding: 'utf8',
};
//# sourceMappingURL=types.js.map