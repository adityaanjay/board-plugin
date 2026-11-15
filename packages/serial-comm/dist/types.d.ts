/**
 * Serial Communication type definitions
 */
/**
 * Serial port configuration
 */
export interface SerialPortConfig {
    path: string;
    baudRate: number;
    dataBits?: 5 | 6 | 7 | 8;
    stopBits?: 1 | 1.5 | 2;
    parity?: 'none' | 'even' | 'odd' | 'mark' | 'space';
    rtscts?: boolean;
    xon?: boolean;
    xoff?: boolean;
    xany?: boolean;
    hupcl?: boolean;
    lock?: boolean;
    autoOpen?: boolean;
    highWaterMark?: number;
    encoding?: BufferEncoding;
}
/**
 * Serial connection state
 */
export type SerialConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error' | 'closing';
/**
 * Serial connection info
 */
export interface SerialConnectionInfo {
    port: string;
    config: SerialPortConfig;
    state: SerialConnectionState;
    connectedAt?: number | undefined;
    bytesReceived: number;
    bytesSent: number;
    lastError?: Error | undefined;
}
/**
 * Data chunk received from serial port
 */
export interface SerialDataChunk {
    port: string;
    data: Buffer | string;
    timestamp: number;
}
/**
 * Serial monitor configuration
 */
export interface SerialMonitorConfig {
    /** Port to monitor */
    port: string;
    /** Baud rate */
    baudRate: number;
    /** Show timestamps */
    timestamps: boolean;
    /** Show direction indicators */
    showDirection: boolean;
    /** Filter regex */
    filter?: string | undefined;
    /** Maximum buffer size */
    maxBufferSize: number;
    /** Encoding */
    encoding: BufferEncoding;
}
/**
 * Serial monitor events
 */
export interface SerialMonitorEvents {
    'data': (chunk: SerialDataChunk) => void;
    'error': (error: Error) => void;
    'open': (port: string) => void;
    'close': (port: string) => void;
    'stateChange': (port: string, state: SerialConnectionState) => void;
}
/**
 * Serial manager options
 */
export interface SerialManagerOptions {
    config?: Partial<SerialPortConfig> | undefined;
    logger?: any;
}
/**
 * Default serial port configuration
 */
export declare const DEFAULT_SERIAL_CONFIG: SerialPortConfig;
/**
 * Default serial monitor configuration
 */
export declare const DEFAULT_MONITOR_CONFIG: SerialMonitorConfig;
//# sourceMappingURL=types.d.ts.map