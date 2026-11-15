/**
 * Board Database type definitions
 */
/**
 * Board type enum
 */
export declare enum BoardType {
    ARDUINO_UNO = "arduino_uno",
    ARDUINO_UNO_R4 = "arduino_uno_r4",
    ARDUINO_MEGA_2560 = "arduino_mega_2560",
    ARDUINO_NANO = "arduino_nano",
    ARDUINO_LEONARDO = "arduino_leonardo",
    ARDUINO_MICRO = "arduino_micro",
    ARDUINO_DUE = "arduino_due",
    ARDUINO_PRO_MINI = "arduino_pro_mini",
    ESP8266 = "esp8266",
    ESP32 = "esp32",
    ESP32_S2 = "esp32_s2",
    ESP32_S3 = "esp32_s3",
    ESP32_C3 = "esp32_c3",
    ESP32_C6 = "esp32_c6",
    ESP32_H2 = "esp32_h2",
    RASPBERRY_PI_PICO = "raspberry_pi_pico",
    STM32 = "stm32",
    TEENSY = "teensy",
    SEEED_XIAO = "seeed_xiao",
    AVR_BOARD = "avr_board",
    ARM_BOARD = "arm_board",
    UNKNOWN = "unknown"
}
/**
 * USB Vendor/Product ID
 */
export interface VidPid {
    vid: string;
    pid: string;
}
/**
 * Board capabilities
 */
export interface BoardCapabilities {
    digitalPins: number;
    analogPins: number;
    pwmPins: number;
    serialPorts: number;
    i2c: boolean;
    spi: boolean;
    wifi: boolean;
    bluetooth: boolean;
    flashSize: number;
    ramSize: number;
    clockSpeed: number;
    voltage: number;
    supportedProtocols: string[];
}
/**
 * Board variant
 */
export interface BoardVariant {
    id: string;
    name: string;
    fqbn: string;
    capabilities: Partial<BoardCapabilities>;
    defines?: Record<string, string>;
}
/**
 * Board definition
 */
export interface BoardDefinition {
    id: string;
    type: BoardType;
    name: string;
    vendor: string;
    description: string;
    vidPids: VidPid[];
    mcu: string;
    fCpu: number;
    flashSize: number;
    ramSize: number;
    eepromSize: number;
    uploadProtocol: string;
    uploadSpeed: number;
    debugProtocol?: string;
    capabilities: BoardCapabilities;
    variants: BoardVariant[];
    defaultVariant: string;
    arduinoCore?: string;
    platformioPlatform?: string;
    platformioBoard?: string;
    esptoolChip?: string;
    tags: string[];
}
/**
 * Board database configuration
 */
export interface BoardDatabaseConfig {
    builtinPath: string;
    userPath?: string;
    cacheEnabled: boolean;
    cacheTtl: number;
}
/**
 * Board search result
 */
export interface BoardSearchResult {
    board: BoardDefinition;
    variant?: BoardVariant;
    matchType: 'exact' | 'vidpid' | 'fuzzy' | 'manual';
    confidence: number;
}
/**
 * Board detection result
 */
export interface BoardDetectionResult {
    board: BoardDefinition;
    variant: BoardVariant;
    port: string;
    vidPid?: VidPid;
    confidence: 'high' | 'medium' | 'low';
    detectionMethod: 'vidpid' | 'bootloader' | 'heuristic';
}
//# sourceMappingURL=types.d.ts.map