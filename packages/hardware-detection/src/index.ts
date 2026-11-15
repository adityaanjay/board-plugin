/**
 * Hardware Detection Module
 * Provides serial port scanning, VID/PID matching, and board identification
 */

export { HardwareDetector, createHardwareDetector, DEFAULT_HARDWARE_DETECTION_CONFIG } from './hardware-detector.js';
export type {
  SerialPortInfo,
  DetectedDevice,
  HardwareDetectionConfig,
  HardwareDetectionResult,
  HardwareDetectorEvents,
  HardwareDetectorOptions,
  VidPid,
} from './types.js';