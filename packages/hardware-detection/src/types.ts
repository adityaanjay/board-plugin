/**
 * Hardware Detection type definitions
 */

import type { BoardDetectionResult } from '@board/board-database';

/**
 * Serial port information
 */
export interface SerialPortInfo {
  path: string;
  manufacturer?: string | undefined;
  serialNumber?: string | undefined;
  pnpId?: string | undefined;
  locationId?: string | undefined;
  vendorId?: string | undefined;
  productId?: string | undefined;
  friendlyName?: string | undefined;
}

/**
 * Detected hardware device
 */
export interface DetectedDevice {
  port: string;
  vid?: string | undefined;
  pid?: string | undefined;
  manufacturer?: string | undefined;
  serialNumber?: string | undefined;
  friendlyName?: string | undefined;
  boardDetection?: BoardDetectionResult | undefined;
  timestamp: number;
}

/**
 * Hardware detection configuration
 */
export interface HardwareDetectionConfig {
  /** Scan interval in milliseconds */
  scanInterval: number;
  /** Enable automatic scanning */
  autoScan: boolean;
  /** Known VID/PID pairs to watch for */
  watchedVidPids: VidPid[];
  /** Custom board definitions path */
  customBoardsPath?: string | undefined;
}

/**
 * VID/PID pair
 */
export interface VidPid {
  vid: string;
  pid: string;
}

/**
 * Hardware detection result
 */
export interface HardwareDetectionResult {
  devices: DetectedDevice[];
  newDevices: DetectedDevice[];
  removedDevices: DetectedDevice[];
  timestamp: number;
}

/**
 * Hardware detector events
 */
export interface HardwareDetectorEvents {
  'device:connected': (device: DetectedDevice) => void;
  'device:disconnected': (device: DetectedDevice) => void;
  'scan:start': () => void;
  'scan:complete': (result: HardwareDetectionResult) => void;
  'scan:error': (error: Error) => void;
  'board:detected': (result: BoardDetectionResult) => void;
}

/**
 * Hardware detector options
 */
export interface HardwareDetectorOptions {
  config?: Partial<HardwareDetectionConfig> | undefined;
  boardDatabase?: any; // BoardDatabase instance
  logger?: any; // Logger instance
}