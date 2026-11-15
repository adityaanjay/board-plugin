/**
 * ESP Manager type definitions
 */
/**
 * ESP tool configuration
 */
export interface EspToolConfig {
    /** Path to esptool executable */
    esptoolPath?: string;
    /** Path to ESP-IDF */
    idfPath?: string;
    /** Default baud rate */
    defaultBaudRate: number;
    /** Flash mode: 'qio', 'qout', 'dio', 'dout' */
    flashMode: 'qio' | 'qout' | 'dio' | 'dout';
    /** Flash frequency: '40m', '26m', '20m', '80m' */
    flashFreq: '40m' | '26m' | '20m' | '80m';
    /** Flash size: '4MB', '2MB', '8MB', '16MB' */
    flashSize: string;
    /** Auto-install esptool if not found */
    autoInstall: boolean;
    /** Verbose output */
    verbose: boolean;
}
/**
 * Flash options
 */
export interface FlashOptions {
    /** Port to flash */
    port: string;
    /** Baud rate */
    baudRate?: number;
    /** Chip type: 'esp32', 'esp32s2', 'esp32s3', 'esp32c3', 'esp32c6', 'esp32h2', 'esp8266' */
    chip?: string;
    /** Flash mode */
    flashMode?: 'qio' | 'qout' | 'dio' | 'dout';
    /** Flash frequency */
    flashFreq?: '40m' | '26m' | '20m' | '80m';
    /** Flash size */
    flashSize?: string;
    /** Address to flash to */
    address: string;
    /** Path to binary file */
    binaryPath: string;
    /** Verify after flash */
    verify?: boolean;
    /** Compress data */
    compress?: boolean;
    /** Erase flash before writing */
    eraseAll?: boolean;
    /** No stub (for older chips) */
    noStub?: boolean;
}
/**
 * Monitor options
 */
export interface MonitorOptions {
    /** Port to monitor */
    port: string;
    /** Baud rate */
    baudRate: number;
    /** Show timestamps */
    timestamps: boolean;
    /** Filter regex */
    filter?: string;
    /** Encoding */
    encoding: BufferEncoding;
}
/**
 * Flash result
 */
export interface FlashResult {
    success: boolean;
    port: string;
    chip: string;
    address: string;
    binaryPath: string;
    output: string;
    error: string | undefined;
    duration: number;
    verified: boolean | undefined;
}
/**
 * ESP chip info
 */
export interface EspChipInfo {
    chip: string;
    features: string[];
    crystalFreq: number;
    macAddress: string;
    flashId: string;
    flashSize: string;
}
/**
 * ESP partition table entry
 */
export interface EspPartition {
    name: string;
    type: string;
    subtype: string;
    address: string;
    size: string;
    encrypted: boolean;
}
/**
 * ESP manager events
 */
export interface EspManagerEvents {
    'flash:start': (port: string, chip: string, address: string) => void;
    'flash:complete': (result: FlashResult) => void;
    'flash:error': (port: string, chip: string, error: Error) => void;
    'monitor:start': (port: string) => void;
    'monitor:data': (port: string, data: string) => void;
    'monitor:error': (port: string, error: Error) => void;
    'monitor:stop': (port: string) => void;
    'chip:detected': (chip: EspChipInfo) => void;
}
/**
 * ESP manager options
 */
export interface EspManagerOptions {
    config?: Partial<EspToolConfig>;
    logger?: any;
}
/**
 * Default ESP tool configuration
 */
export declare const DEFAULT_ESP_TOOL_CONFIG: EspToolConfig;
//# sourceMappingURL=types.d.ts.map