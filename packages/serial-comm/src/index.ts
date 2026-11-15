/**
 * Serial Communication Module
 * Provides serial port management, data streaming, and monitoring
 */

export { SerialManager, createSerialManager } from './serial-manager.js';
export {
  DEFAULT_SERIAL_CONFIG,
  DEFAULT_MONITOR_CONFIG,
} from './types.js';
export type {
  SerialPortConfig,
  SerialConnectionState,
  SerialConnectionInfo,
  SerialDataChunk,
  SerialMonitorConfig,
  SerialMonitorEvents,
  SerialManagerOptions,
} from './types.js';