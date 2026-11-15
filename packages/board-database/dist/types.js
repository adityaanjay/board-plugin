"use strict";
/**
 * Board Database type definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardType = void 0;
/**
 * Board type enum
 */
var BoardType;
(function (BoardType) {
    // Arduino boards
    BoardType["ARDUINO_UNO"] = "arduino_uno";
    BoardType["ARDUINO_UNO_R4"] = "arduino_uno_r4";
    BoardType["ARDUINO_MEGA_2560"] = "arduino_mega_2560";
    BoardType["ARDUINO_NANO"] = "arduino_nano";
    BoardType["ARDUINO_LEONARDO"] = "arduino_leonardo";
    BoardType["ARDUINO_MICRO"] = "arduino_micro";
    BoardType["ARDUINO_DUE"] = "arduino_due";
    BoardType["ARDUINO_PRO_MINI"] = "arduino_pro_mini";
    // ESP boards
    BoardType["ESP8266"] = "esp8266";
    BoardType["ESP32"] = "esp32";
    BoardType["ESP32_S2"] = "esp32_s2";
    BoardType["ESP32_S3"] = "esp32_s3";
    BoardType["ESP32_C3"] = "esp32_c3";
    BoardType["ESP32_C6"] = "esp32_c6";
    BoardType["ESP32_H2"] = "esp32_h2";
    // Expansion boards (future)
    BoardType["RASPBERRY_PI_PICO"] = "raspberry_pi_pico";
    BoardType["STM32"] = "stm32";
    BoardType["TEENSY"] = "teensy";
    BoardType["SEEED_XIAO"] = "seeed_xiao";
    BoardType["AVR_BOARD"] = "avr_board";
    BoardType["ARM_BOARD"] = "arm_board";
    // Unknown
    BoardType["UNKNOWN"] = "unknown";
})(BoardType || (exports.BoardType = BoardType = {}));
//# sourceMappingURL=types.js.map