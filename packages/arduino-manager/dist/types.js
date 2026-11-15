"use strict";
/**
 * Arduino Manager type definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ARDUINO_CLI_CONFIG = void 0;
/**
 * Default Arduino CLI configuration
 */
exports.DEFAULT_ARDUINO_CLI_CONFIG = {
    boardManagerUrls: [
        'https://downloads.arduino.cc/packages/package_index.json',
        'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json',
    ],
    defaultFqbn: 'arduino:avr:uno',
    libraryPaths: [],
    autoInstall: true,
    verbose: false,
};
//# sourceMappingURL=types.js.map