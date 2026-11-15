/**
 * Board Definitions Database
 * Comprehensive definitions for all supported boards
 */

import { BoardType } from '../types.js';
import type { BoardDefinition, BoardVariant, VidPid } from '../types.js';

// Arduino VID/PIDs
const ARDUINO_VID = '2341'; // Arduino LLC
const ARDUINO_VID_OLD = '2A03'; // Arduino LLC (old)
const FTDI_VID = '0403'; // FTDI
const CH340_VID = '1A86'; // QinHeng Electronics (CH340)
const CP2102_VID = '10C4'; // Silicon Labs (CP210x)
const ESPRESSIF_VID = '303A'; // Espressif

/**
 * Create a VID/PID pair
 */
function vp(vid: string, pid: string): VidPid {
  return { vid, pid };
}

/**
 * Arduino Uno R3
 */
const ARDUINO_UNO: BoardDefinition = {
  id: 'arduino_uno',
  type: BoardType.ARDUINO_UNO,
  name: 'Arduino Uno R3',
  vendor: 'Arduino',
  description: 'Classic Arduino Uno based on ATmega328P',
  vidPids: [
    vp(ARDUINO_VID, '0043'), // Official Uno R3
    vp(ARDUINO_VID_OLD, '0043'), // Old VID
    vp(FTDI_VID, '6001'), // FTDI clone
    vp(CH340_VID, '7523'), // CH340 clone
    vp(CP2102_VID, 'EA60'), // CP2102 clone
  ],
  mcu: 'ATmega328P',
  fCpu: 16_000_000,
  flashSize: 32_768,
  ramSize: 2_048,
  eepromSize: 1_024,
  uploadProtocol: 'arduino',
  uploadSpeed: 115200,
  debugProtocol: 'debugwire',
  capabilities: {
    digitalPins: 14,
    analogPins: 6,
    pwmPins: 6,
    serialPorts: 1,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: false,
    flashSize: 32,
    ramSize: 2,
    clockSpeed: 16,
    voltage: 5,
    supportedProtocols: ['UART', 'I2C', 'SPI'],
  },
  variants: [
    {
      id: 'standard',
      name: 'Standard',
      fqbn: 'arduino:avr:uno',
      capabilities: {},
    },
  ],
  defaultVariant: 'standard',
  arduinoCore: 'arduino:avr',
  platformioPlatform: 'atmelavr',
  platformioBoard: 'uno',
  tags: ['arduino', 'avr', 'uno', 'beginner'],
};

/**
 * Arduino Uno R4 Minima
 */
const ARDUINO_UNO_R4_MINIMA: BoardDefinition = {
  id: 'arduino_uno_r4_minima',
  type: BoardType.ARDUINO_UNO_R4,
  name: 'Arduino Uno R4 Minima',
  vendor: 'Arduino',
  description: 'Arduino Uno R4 with RA4M1 (ARM Cortex-M4)',
  vidPids: [
    vp(ARDUINO_VID, '006D'), // Official R4 Minima
  ],
  mcu: 'RA4M1 (R7FA4M1AB3CFM)',
  fCpu: 48_000_000,
  flashSize: 256_000,
  ramSize: 32_768,
  eepromSize: 0, // Emulated
  uploadProtocol: 'uart',
  uploadSpeed: 115200,
  debugProtocol: 'swd',
  capabilities: {
    digitalPins: 14,
    analogPins: 6,
    pwmPins: 6,
    serialPorts: 1,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: false,
    flashSize: 256,
    ramSize: 32,
    clockSpeed: 48,
    voltage: 5,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'CAN', 'USB'],
  },
  variants: [
    {
      id: 'minima',
      name: 'Minima',
      fqbn: 'arduino:renesas_uno:unor4minima',
      capabilities: {},
    },
  ],
  defaultVariant: 'minima',
  arduinoCore: 'arduino:renesas_uno',
  platformioPlatform: 'renesas-ra',
  platformioBoard: 'unor4minima',
  tags: ['arduino', 'renesas', 'arm', 'cortex-m4', 'uno-r4'],
};

/**
 * Arduino Uno R4 WiFi
 */
const ARDUINO_UNO_R4_WIFI: BoardDefinition = {
  id: 'arduino_uno_r4_wifi',
  type: BoardType.ARDUINO_UNO_R4,
  name: 'Arduino Uno R4 WiFi',
  vendor: 'Arduino',
  description: 'Arduino Uno R4 with RA4M1 and ESP32-S3 for WiFi/Bluetooth',
  vidPids: [
    vp(ARDUINO_VID, '006E'), // Official R4 WiFi
  ],
  mcu: 'RA4M1 (R7FA4M1AB3CFM) + ESP32-S3',
  fCpu: 48_000_000,
  flashSize: 256_000,
  ramSize: 32_768,
  eepromSize: 0,
  uploadProtocol: 'uart',
  uploadSpeed: 115200,
  debugProtocol: 'swd',
  capabilities: {
    digitalPins: 14,
    analogPins: 6,
    pwmPins: 6,
    serialPorts: 1,
    i2c: true,
    spi: true,
    wifi: true,
    bluetooth: true,
    flashSize: 256,
    ramSize: 32,
    clockSpeed: 48,
    voltage: 5,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'CAN', 'USB', 'WiFi', 'Bluetooth'],
  },
  variants: [
    {
      id: 'wifi',
      name: 'WiFi',
      fqbn: 'arduino:renesas_uno:unor4wifi',
      capabilities: {},
    },
  ],
  defaultVariant: 'wifi',
  arduinoCore: 'arduino:renesas_uno',
  platformioPlatform: 'renesas-ra',
  platformioBoard: 'unor4wifi',
  tags: ['arduino', 'renesas', 'arm', 'cortex-m4', 'uno-r4', 'wifi', 'bluetooth'],
};

/**
 * Arduino Mega 2560 R3
 */
const ARDUINO_MEGA_2560: BoardDefinition = {
  id: 'arduino_mega_2560',
  type: BoardType.ARDUINO_MEGA_2560,
  name: 'Arduino Mega 2560 R3',
  vendor: 'Arduino',
  description: 'Arduino Mega with ATmega2560 - more pins and memory',
  vidPids: [
    vp(ARDUINO_VID, '0010'), // Official Mega 2560
    vp(ARDUINO_VID_OLD, '0010'),
    vp(FTDI_VID, '6001'),
    vp(CH340_VID, '7523'),
    vp(CP2102_VID, 'EA60'),
  ],
  mcu: 'ATmega2560',
  fCpu: 16_000_000,
  flashSize: 256_000,
  ramSize: 8_192,
  eepromSize: 4_096,
  uploadProtocol: 'wiring',
  uploadSpeed: 115200,
  debugProtocol: 'debugwire',
  capabilities: {
    digitalPins: 54,
    analogPins: 16,
    pwmPins: 15,
    serialPorts: 4,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: false,
    flashSize: 256,
    ramSize: 8,
    clockSpeed: 16,
    voltage: 5,
    supportedProtocols: ['UART', 'I2C', 'SPI'],
  },
  variants: [
    {
      id: 'standard',
      name: 'Standard',
      fqbn: 'arduino:avr:mega',
      capabilities: {},
    },
  ],
  defaultVariant: 'standard',
  arduinoCore: 'arduino:avr',
  platformioPlatform: 'atmelavr',
  platformioBoard: 'megaatmega2560',
  tags: ['arduino', 'avr', 'mega', 'many-pins'],
};

/**
 * Arduino Nano (Old bootloader)
 */
const ARDUINO_NANO: BoardDefinition = {
  id: 'arduino_nano',
  type: BoardType.ARDUINO_NANO,
  name: 'Arduino Nano (ATmega328P)',
  vendor: 'Arduino',
  description: 'Compact Arduino Nano with ATmega328P',
  vidPids: [
    vp(ARDUINO_VID, '0043'), // Official Nano
    vp(FTDI_VID, '6001'),
    vp(CH340_VID, '7523'),
    vp(CP2102_VID, 'EA60'),
  ],
  mcu: 'ATmega328P',
  fCpu: 16_000_000,
  flashSize: 32_768,
  ramSize: 2_048,
  eepromSize: 1_024,
  uploadProtocol: 'arduino',
  uploadSpeed: 115200,
  debugProtocol: 'debugwire',
  capabilities: {
    digitalPins: 14,
    analogPins: 8,
    pwmPins: 6,
    serialPorts: 1,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: false,
    flashSize: 32,
    ramSize: 2,
    clockSpeed: 16,
    voltage: 5,
    supportedProtocols: ['UART', 'I2C', 'SPI'],
  },
  variants: [
    {
      id: 'standard',
      name: 'Standard (ATmega328P)',
      fqbn: 'arduino:avr:nano',
      capabilities: {},
    },
    {
      id: 'old_bootloader',
      name: 'Old Bootloader (ATmega328P)',
      fqbn: 'arduino:avr:nano:cpu=328old',
      capabilities: {},
    },
  ],
  defaultVariant: 'standard',
  arduinoCore: 'arduino:avr',
  platformioPlatform: 'atmelavr',
  platformioBoard: 'nanoatmega328',
  tags: ['arduino', 'avr', 'nano', 'compact'],
};

/**
 * Arduino Nano Every
 */
const ARDUINO_NANO_EVERY: BoardDefinition = {
  id: 'arduino_nano_every',
  type: BoardType.ARDUINO_NANO,
  name: 'Arduino Nano Every',
  vendor: 'Arduino',
  description: 'Nano form factor with ATmega4809',
  vidPids: [
    vp(ARDUINO_VID, '005E'), // Official Nano Every
  ],
  mcu: 'ATmega4809',
  fCpu: 20_000_000,
  flashSize: 48_000,
  ramSize: 6_144,
  eepromSize: 256,
  uploadProtocol: 'uart',
  uploadSpeed: 115200,
  debugProtocol: 'updi',
  capabilities: {
    digitalPins: 14,
    analogPins: 8,
    pwmPins: 5,
    serialPorts: 1,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: false,
    flashSize: 48,
    ramSize: 6,
    clockSpeed: 20,
    voltage: 5,
    supportedProtocols: ['UART', 'I2C', 'SPI'],
  },
  variants: [
    {
      id: 'standard',
      name: 'Standard',
      fqbn: 'arduino:megaavr:nanoevery',
      capabilities: {},
    },
  ],
  defaultVariant: 'standard',
  arduinoCore: 'arduino:megaavr',
  platformioPlatform: 'megaavr',
  platformioBoard: 'nanoevery',
  tags: ['arduino', 'megaavr', 'nano', 'compact'],
};

/**
 * Arduino Leonardo
 */
const ARDUINO_LEONARDO: BoardDefinition = {
  id: 'arduino_leonardo',
  type: BoardType.ARDUINO_LEONARDO,
  name: 'Arduino Leonardo',
  vendor: 'Arduino',
  description: 'Arduino with built-in USB (ATmega32U4) - can act as HID',
  vidPids: [
    vp(ARDUINO_VID, '0036'), // Official Leonardo
    vp(ARDUINO_VID_OLD, '0036'),
  ],
  mcu: 'ATmega32U4',
  fCpu: 16_000_000,
  flashSize: 32_768,
  ramSize: 2_560,
  eepromSize: 1_024,
  uploadProtocol: 'avr109',
  uploadSpeed: 57600,
  debugProtocol: 'debugwire',
  capabilities: {
    digitalPins: 20,
    analogPins: 12,
    pwmPins: 7,
    serialPorts: 1,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: false,
    flashSize: 32,
    ramSize: 2.5,
    clockSpeed: 16,
    voltage: 5,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'USB-HID'],
  },
  variants: [
    {
      id: 'standard',
      name: 'Standard',
      fqbn: 'arduino:avr:leonardo',
      capabilities: {},
    },
  ],
  defaultVariant: 'standard',
  arduinoCore: 'arduino:avr',
  platformioPlatform: 'atmelavr',
  platformioBoard: 'leonardo',
  tags: ['arduino', 'avr', 'leonardo', 'hid', 'usb-native'],
};

/**
 * Arduino Micro
 */
const ARDUINO_MICRO: BoardDefinition = {
  id: 'arduino_micro',
  type: BoardType.ARDUINO_MICRO,
  name: 'Arduino Micro',
  vendor: 'Arduino',
  description: 'Small form factor Leonardo with ATmega32U4',
  vidPids: [
    vp(ARDUINO_VID, '0037'), // Official Micro
    vp(ARDUINO_VID_OLD, '0037'),
  ],
  mcu: 'ATmega32U4',
  fCpu: 16_000_000,
  flashSize: 32_768,
  ramSize: 2_560,
  eepromSize: 1_024,
  uploadProtocol: 'avr109',
  uploadSpeed: 57600,
  debugProtocol: 'debugwire',
  capabilities: {
    digitalPins: 20,
    analogPins: 12,
    pwmPins: 7,
    serialPorts: 1,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: false,
    flashSize: 32,
    ramSize: 2.5,
    clockSpeed: 16,
    voltage: 5,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'USB-HID'],
  },
  variants: [
    {
      id: 'standard',
      name: 'Standard',
      fqbn: 'arduino:avr:micro',
      capabilities: {},
    },
  ],
  defaultVariant: 'standard',
  arduinoCore: 'arduino:avr',
  platformioPlatform: 'atmelavr',
  platformioBoard: 'micro',
  tags: ['arduino', 'avr', 'micro', 'compact', 'hid'],
};

/**
 * Arduino Due
 */
const ARDUINO_DUE: BoardDefinition = {
  id: 'arduino_due',
  type: BoardType.ARDUINO_DUE,
  name: 'Arduino Due',
  vendor: 'Arduino',
  description: 'Arduino with ARM Cortex-M3 (SAM3X8E)',
  vidPids: [
    vp(ARDUINO_VID, '003D'), // Programming port
    vp(ARDUINO_VID, '003E'), // Native port
  ],
  mcu: 'SAM3X8E (ARM Cortex-M3)',
  fCpu: 84_000_000,
  flashSize: 512_000,
  ramSize: 96_000,
  eepromSize: 0,
  uploadProtocol: 'bossac',
  uploadSpeed: 115200,
  debugProtocol: 'jtag',
  capabilities: {
    digitalPins: 54,
    analogPins: 12,
    pwmPins: 12,
    serialPorts: 4,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: false,
    flashSize: 512,
    ramSize: 96,
    clockSpeed: 84,
    voltage: 3.3,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'CAN', 'USB'],
  },
  variants: [
    {
      id: 'standard',
      name: 'Standard',
      fqbn: 'arduino:sam:due',
      capabilities: {},
    },
  ],
  defaultVariant: 'standard',
  arduinoCore: 'arduino:sam',
  platformioPlatform: 'atsam',
  platformioBoard: 'due',
  tags: ['arduino', 'sam', 'arm', 'cortex-m3', 'due', '3.3v'],
};

/**
 * Arduino Pro Mini
 */
const ARDUINO_PRO_MINI: BoardDefinition = {
  id: 'arduino_pro_mini',
  type: BoardType.ARDUINO_PRO_MINI,
  name: 'Arduino Pro Mini',
  vendor: 'Arduino',
  description: 'Minimal Arduino for embedding (ATmega328P or ATmega168)',
  vidPids: [
    vp(FTDI_VID, '6001'),
    vp(CH340_VID, '7523'),
    vp(CP2102_VID, 'EA60'),
  ],
  mcu: 'ATmega328P',
  fCpu: 16_000_000,
  flashSize: 32_768,
  ramSize: 2_048,
  eepromSize: 1_024,
  uploadProtocol: 'arduino',
  uploadSpeed: 57600,
  debugProtocol: 'debugwire',
  capabilities: {
    digitalPins: 14,
    analogPins: 8,
    pwmPins: 6,
    serialPorts: 1,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: false,
    flashSize: 32,
    ramSize: 2,
    clockSpeed: 16,
    voltage: 5, // Also available in 3.3V/8MHz
    supportedProtocols: ['UART', 'I2C', 'SPI'],
  },
  variants: [
    {
      id: '5v_16mhz',
      name: '5V / 16MHz',
      fqbn: 'arduino:avr:pro:cpu=16MHzatmega328',
      capabilities: { voltage: 5, clockSpeed: 16 },
    },
    {
      id: '3v3_8mhz',
      name: '3.3V / 8MHz',
      fqbn: 'arduino:avr:pro:cpu=8MHzatmega328',
      capabilities: { voltage: 3.3, clockSpeed: 8 },
    },
  ],
  defaultVariant: '5v_16mhz',
  arduinoCore: 'arduino:avr',
  platformioPlatform: 'atmelavr',
  platformioBoard: 'promini16', // or promini8 for 3.3V
  tags: ['arduino', 'avr', 'pro-mini', 'compact', 'embedding'],
};

// ============================================================
// ESP Boards
// ============================================================

/**
 * Generic ESP8266
 */
const ESP8266_GENERIC: BoardDefinition = {
  id: 'esp8266_generic',
  type: BoardType.ESP8266,
  name: 'Generic ESP8266 Module',
  vendor: 'Espressif',
  description: 'Generic ESP8266 module (ESP-01, ESP-12, NodeMCU, Wemos D1 Mini, etc.)',
  vidPids: [
    vp(ESPRESSIF_VID, '1001'), // ESP8266 native USB (rare)
    vp(CP2102_VID, 'EA60'), // CP2102 on NodeMCU/Wemos
    vp(CH340_VID, '7523'), // CH340 on clones
    vp(FTDI_VID, '6001'), // FTDI on some boards
  ],
  mcu: 'ESP8266EX (Xtensa L106)',
  fCpu: 80_000_000,
  flashSize: 4_194_304, // 4MB typical
  ramSize: 81_920, // ~80KB user RAM
  eepromSize: 0, // Emulated in flash
  uploadProtocol: 'esptool',
  uploadSpeed: 921600,
  debugProtocol: 'gdbstub',
  esptoolChip: 'esp8266',
  capabilities: {
    digitalPins: 17,
    analogPins: 1, // ADC0 only
    pwmPins: 17, // All GPIOs can do PWM via software
    serialPorts: 2,
    i2c: true,
    spi: true,
    wifi: true,
    bluetooth: false,
    flashSize: 4096,
    ramSize: 80,
    clockSpeed: 80,
    voltage: 3.3,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'WiFi', 'I2S'],
  },
  variants: [
    {
      id: 'generic_4mb',
      name: 'Generic 4MB Flash',
      fqbn: 'esp8266:esp8266:generic:FlashSize=4M',
      capabilities: { flashSize: 4096 },
    },
    {
      id: 'generic_1mb',
      name: 'Generic 1MB Flash',
      fqbn: 'esp8266:esp8266:generic:FlashSize=1M',
      capabilities: { flashSize: 1024 },
    },
    {
      id: 'nodemcu',
      name: 'NodeMCU 1.0 (ESP-12E)',
      fqbn: 'esp8266:esp8266:nodemcu',
      capabilities: { flashSize: 4096 },
    },
    {
      id: 'd1_mini',
      name: 'Wemos D1 Mini',
      fqbn: 'esp8266:esp8266:d1_mini',
      capabilities: { flashSize: 4096 },
    },
  ],
  defaultVariant: 'generic_4mb',
  arduinoCore: 'esp8266:esp8266',
  platformioPlatform: 'espressif8266',
  platformioBoard: 'esp8266',
  tags: ['esp', 'esp8266', 'wifi', 'xtensa', 'low-cost'],
};

/**
 * ESP32 DevKit V1 / DevKitC
 */
const ESP32_DEVKIT: BoardDefinition = {
  id: 'esp32_devkit',
  type: BoardType.ESP32,
  name: 'ESP32 DevKit V1 / DevKitC',
  vendor: 'Espressif',
  description: 'Classic ESP32 development board with ESP-WROOM-32',
  vidPids: [
    vp(ESPRESSIF_VID, '1001'), // ESP32 native USB (rare)
    vp(CP2102_VID, 'EA60'), // CP2102 on DevKitC
    vp(CH340_VID, '7523'), // CH340 on clones
    vp(FTDI_VID, '6001'), // FTDI on some boards
  ],
  mcu: 'ESP32-D0WDQ6 (Xtensa Dual-core LX6)',
  fCpu: 240_000_000,
  flashSize: 4_194_304, // 4MB typical
  ramSize: 524_288, // 512KB (320KB user)
  eepromSize: 0,
  uploadProtocol: 'esptool',
  uploadSpeed: 921600,
  debugProtocol: 'jtag',
  esptoolChip: 'esp32',
  capabilities: {
    digitalPins: 34,
    analogPins: 18,
    pwmPins: 16, // LEDC channels
    serialPorts: 3,
    i2c: true,
    spi: true,
    wifi: true,
    bluetooth: true, // Classic + BLE
    flashSize: 4096,
    ramSize: 512,
    clockSpeed: 240,
    voltage: 3.3,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'WiFi', 'Bluetooth', 'BLE', 'I2S', 'CAN', 'Ethernet'],
  },
  variants: [
    {
      id: 'devkit_v1',
      name: 'DevKit V1 (4MB Flash)',
      fqbn: 'esp32:esp32:esp32:FlashSize=4MB,PartitionScheme=default',
      capabilities: { flashSize: 4096 },
    },
    {
      id: 'devkit_v1_16mb',
      name: 'DevKit V1 (16MB Flash)',
      fqbn: 'esp32:esp32:esp32:FlashSize=16MB,PartitionScheme=default',
      capabilities: { flashSize: 16384 },
    },
    {
      id: 'pico_d4',
      name: 'ESP32-Pico-D4',
      fqbn: 'esp32:esp32:pico32:FlashSize=4MB,PartitionScheme=default',
      capabilities: { flashSize: 4096 },
    },
  ],
  defaultVariant: 'devkit_v1',
  arduinoCore: 'esp32:esp32',
  platformioPlatform: 'espressif32',
  platformioBoard: 'esp32dev',
  tags: ['esp', 'esp32', 'wifi', 'bluetooth', 'ble', 'dual-core', 'xtensa'],
};

/**
 * ESP32-S2
 */
const ESP32_S2: BoardDefinition = {
  id: 'esp32_s2',
  type: BoardType.ESP32_S2,
  name: 'ESP32-S2 (Saola-1, etc.)',
  vendor: 'Espressif',
  description: 'ESP32-S2 with single-core Xtensa LX7, USB OTG, no Bluetooth',
  vidPids: [
    vp(ESPRESSIF_VID, '1001'), // Native USB
    vp(CP2102_VID, 'EA60'),
    vp(CH340_VID, '7523'),
  ],
  mcu: 'ESP32-S2 (Xtensa Single-core LX7)',
  fCpu: 240_000_000,
  flashSize: 4_194_304,
  ramSize: 327_680, // 320KB
  eepromSize: 0,
  uploadProtocol: 'esptool',
  uploadSpeed: 921600,
  debugProtocol: 'jtag',
  esptoolChip: 'esp32s2',
  capabilities: {
    digitalPins: 43,
    analogPins: 20,
    pwmPins: 8, // LEDC channels
    serialPorts: 2,
    i2c: true,
    spi: true,
    wifi: true,
    bluetooth: false,
    flashSize: 4096,
    ramSize: 320,
    clockSpeed: 240,
    voltage: 3.3,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'WiFi', 'USB-OTG', 'I2S', 'Camera'],
  },
  variants: [
    {
      id: 'saola_1',
      name: 'ESP32-S2 Saola-1',
      fqbn: 'esp32:esp32:esp32s2:FlashSize=4MB,PartitionScheme=default',
      capabilities: { flashSize: 4096 },
    },
  ],
  defaultVariant: 'saola_1',
  arduinoCore: 'esp32:esp32',
  platformioPlatform: 'espressif32',
  platformioBoard: 'esp32s2',
  tags: ['esp', 'esp32-s2', 'wifi', 'usb-otg', 'single-core', 'xtensa', 'no-bluetooth'],
};

/**
 * ESP32-S3
 */
const ESP32_S3: BoardDefinition = {
  id: 'esp32_s3',
  type: BoardType.ESP32_S3,
  name: 'ESP32-S3 (DevKitC-1, etc.)',
  vendor: 'Espressif',
  description: 'ESP32-S3 with dual-core Xtensa LX7, USB OTG, Bluetooth 5',
  vidPids: [
    vp(ESPRESSIF_VID, '1001'), // Native USB
    vp(CP2102_VID, 'EA60'),
    vp(CH340_VID, '7523'),
  ],
  mcu: 'ESP32-S3 (Xtensa Dual-core LX7)',
  fCpu: 240_000_000,
  flashSize: 8_388_608, // 8MB typical
  ramSize: 512_000, // 512KB SRAM + 384KB ROM
  eepromSize: 0,
  uploadProtocol: 'esptool',
  uploadSpeed: 921600,
  debugProtocol: 'jtag',
  esptoolChip: 'esp32s3',
  capabilities: {
    digitalPins: 45,
    analogPins: 20,
    pwmPins: 8, // LEDC channels
    serialPorts: 3,
    i2c: true,
    spi: true,
    wifi: true,
    bluetooth: true, // BLE 5 + Classic
    flashSize: 8192,
    ramSize: 512,
    clockSpeed: 240,
    voltage: 3.3,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'WiFi', 'Bluetooth', 'BLE', 'USB-OTG', 'I2S', 'Camera', 'Touch'],
  },
  variants: [
    {
      id: 'devkitc_1',
      name: 'ESP32-S3 DevKitC-1',
      fqbn: 'esp32:esp32:esp32s3:FlashSize=8MB,PartitionScheme=default',
      capabilities: { flashSize: 8192 },
    },
    {
      id: 'devkitc_1_n8r8',
      name: 'ESP32-S3 DevKitC-1 (8MB Flash, 8MB PSRAM)',
      fqbn: 'esp32:esp32:esp32s3:FlashSize=8MB,PartitionScheme=default,PSRAM=opi',
      capabilities: { flashSize: 8192 },
    },
  ],
  defaultVariant: 'devkitc_1',
  arduinoCore: 'esp32:esp32',
  platformioPlatform: 'espressif32',
  platformioBoard: 'esp32s3',
  tags: ['esp', 'esp32-s3', 'wifi', 'bluetooth', 'ble', 'dual-core', 'xtensa', 'usb-otg', 'psram'],
};

/**
 * ESP32-C3
 */
const ESP32_C3: BoardDefinition = {
  id: 'esp32_c3',
  type: BoardType.ESP32_C3,
  name: 'ESP32-C3 (DevKitC-02, etc.)',
  vendor: 'Espressif',
  description: 'ESP32-C3 with single-core RISC-V, Bluetooth 5, no WiFi 6',
  vidPids: [
    vp(ESPRESSIF_VID, '1001'), // Native USB
    vp(CP2102_VID, 'EA60'),
    vp(CH340_VID, '7523'),
  ],
  mcu: 'ESP32-C3 (RISC-V Single-core)',
  fCpu: 160_000_000,
  flashSize: 4_194_304,
  ramSize: 409_600, // 400KB
  eepromSize: 0,
  uploadProtocol: 'esptool',
  uploadSpeed: 921600,
  debugProtocol: 'jtag',
  esptoolChip: 'esp32c3',
  capabilities: {
    digitalPins: 22,
    analogPins: 6,
    pwmPins: 6, // LEDC channels
    serialPorts: 2,
    i2c: true,
    spi: true,
    wifi: true,
    bluetooth: true, // BLE 5 only
    flashSize: 4096,
    ramSize: 400,
    clockSpeed: 160,
    voltage: 3.3,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'WiFi', 'BLE', 'USB', 'I2S'],
  },
  variants: [
    {
      id: 'devkitc_02',
      name: 'ESP32-C3 DevKitC-02',
      fqbn: 'esp32:esp32:esp32c3:FlashSize=4MB,PartitionScheme=default',
      capabilities: { flashSize: 4096 },
    },
    {
      id: 'supermini',
      name: 'ESP32-C3 SuperMini',
      fqbn: 'esp32:esp32:esp32c3:FlashSize=4MB,PartitionScheme=default',
      capabilities: { flashSize: 4096 },
    },
  ],
  defaultVariant: 'devkitc_02',
  arduinoCore: 'esp32:esp32',
  platformioPlatform: 'espressif32',
  platformioBoard: 'esp32c3',
  tags: ['esp', 'esp32-c3', 'wifi', 'ble', 'risc-v', 'single-core', 'low-power'],
};

/**
 * ESP32-C6
 */
const ESP32_C6: BoardDefinition = {
  id: 'esp32_c6',
  type: BoardType.ESP32_C6,
  name: 'ESP32-C6 (DevKitC-06, etc.)',
  vendor: 'Espressif',
  description: 'ESP32-C6 with RISC-V, WiFi 6, Bluetooth 5, Thread/Zigbee',
  vidPids: [
    vp(ESPRESSIF_VID, '1001'), // Native USB
    vp(CP2102_VID, 'EA60'),
    vp(CH340_VID, '7523'),
  ],
  mcu: 'ESP32-C6 (RISC-V Single-core)',
  fCpu: 160_000_000,
  flashSize: 4_194_304,
  ramSize: 512_000, // 512KB
  eepromSize: 0,
  uploadProtocol: 'esptool',
  uploadSpeed: 921600,
  debugProtocol: 'jtag',
  esptoolChip: 'esp32c6',
  capabilities: {
    digitalPins: 30,
    analogPins: 6,
    pwmPins: 6, // LEDC channels
    serialPorts: 2,
    i2c: true,
    spi: true,
    wifi: true,
    bluetooth: true, // BLE 5 + Thread/Zigbee
    flashSize: 4096,
    ramSize: 512,
    clockSpeed: 160,
    voltage: 3.3,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'WiFi', 'WiFi6', 'BLE', 'Thread', 'Zigbee', 'USB'],
  },
  variants: [
    {
      id: 'devkitc_06',
      name: 'ESP32-C6 DevKitC-06',
      fqbn: 'esp32:esp32:esp32c6:FlashSize=4MB,PartitionScheme=default',
      capabilities: { flashSize: 4096 },
    },
  ],
  defaultVariant: 'devkitc_06',
  arduinoCore: 'esp32:esp32',
  platformioPlatform: 'espressif32',
  platformioBoard: 'esp32c6',
  tags: ['esp', 'esp32-c6', 'wifi', 'wifi6', 'ble', 'thread', 'zigbee', 'risc-v', 'matter'],
};

/**
 * ESP32-H2
 */
const ESP32_H2: BoardDefinition = {
  id: 'esp32_h2',
  type: BoardType.ESP32_H2,
  name: 'ESP32-H2 (DevKit, etc.)',
  vendor: 'Espressif',
  description: 'ESP32-H2 with RISC-V, Bluetooth 5, Thread/Zigbee, no WiFi',
  vidPids: [
    vp(ESPRESSIF_VID, '1001'), // Native USB
    vp(CP2102_VID, 'EA60'),
    vp(CH340_VID, '7523'),
  ],
  mcu: 'ESP32-H2 (RISC-V Single-core)',
  fCpu: 96_000_000,
  flashSize: 4_194_304,
  ramSize: 320_000, // 320KB
  eepromSize: 0,
  uploadProtocol: 'esptool',
  uploadSpeed: 921600,
  debugProtocol: 'jtag',
  esptoolChip: 'esp32h2',
  capabilities: {
    digitalPins: 26,
    analogPins: 6,
    pwmPins: 6, // LEDC channels
    serialPorts: 2,
    i2c: true,
    spi: true,
    wifi: false,
    bluetooth: true, // BLE 5 + Thread/Zigbee
    flashSize: 4096,
    ramSize: 320,
    clockSpeed: 96,
    voltage: 3.3,
    supportedProtocols: ['UART', 'I2C', 'SPI', 'BLE', 'Thread', 'Zigbee', 'USB', 'IEEE-802.15.4'],
  },
  variants: [
    {
      id: 'devkit',
      name: 'ESP32-H2 DevKit',
      fqbn: 'esp32:esp32:esp32h2:FlashSize=4MB,PartitionScheme=default',
      capabilities: { flashSize: 4096 },
    },
  ],
  defaultVariant: 'devkit',
  arduinoCore: 'esp32:esp32',
  platformioPlatform: 'espressif32',
  platformioBoard: 'esp32h2',
  tags: ['esp', 'esp32-h2', 'ble', 'thread', 'zigbee', 'risc-v', 'no-wifi', 'matter', 'ieee-802.15.4'],
};

// ============================================================
// All Board Definitions Array
// ============================================================

export const BOARD_DEFINITIONS: BoardDefinition[] = [
  // Arduino
  ARDUINO_UNO,
  ARDUINO_UNO_R4_MINIMA,
  ARDUINO_UNO_R4_WIFI,
  ARDUINO_MEGA_2560,
  ARDUINO_NANO,
  ARDUINO_NANO_EVERY,
  ARDUINO_LEONARDO,
  ARDUINO_MICRO,
  ARDUINO_DUE,
  ARDUINO_PRO_MINI,
  // ESP
  ESP8266_GENERIC,
  ESP32_DEVKIT,
  ESP32_S2,
  ESP32_S3,
  ESP32_C3,
  ESP32_C6,
  ESP32_H2,
];

/**
 * Get board definition by ID
 */
export function getBoardById(id: string): BoardDefinition | undefined {
  return BOARD_DEFINITIONS.find(b => b.id === id);
}

/**
 * Get board definition by type
 */
export function getBoardsByType(type: BoardType): BoardDefinition[] {
  return BOARD_DEFINITIONS.filter(b => b.type === type);
}

/**
 * Find board by VID/PID
 */
export function findByVidPid(vid: string, pid: string): BoardDefinition[] {
  return BOARD_DEFINITIONS.filter(b =>
    b.vidPids.some(vp => vp.vid.toLowerCase() === vid.toLowerCase() && vp.pid.toLowerCase() === pid.toLowerCase())
  );
}

/**
 * Get all board definitions
 */
export function getAllBoards(): BoardDefinition[] {
  return [...BOARD_DEFINITIONS];
}

/**
 * Get board variants
 */
export function getBoardVariants(boardId: string): BoardVariant[] {
  const board = getBoardById(boardId);
  return board?.variants || [];
}

/**
 * Get default variant for a board
 */
export function getDefaultVariant(boardId: string): BoardVariant | undefined {
  const board = getBoardById(boardId);
  if (!board) return undefined;
  return board.variants.find(v => v.id === board.defaultVariant);
}