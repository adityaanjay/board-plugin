/**
 * Board Database tests
 */

import { describe, it, expect } from 'vitest';
import { createBoardDatabase } from '../board-database.js';
import { BoardType } from '../types.js';

describe('BoardDatabase', () => {
  const db = createBoardDatabase();

  it('should create a board database instance', () => {
    expect(db).toBeDefined();
  });

  it('should have all required Arduino boards', () => {
    const arduinoBoards = db.getBoardsByType(BoardType.ARDUINO_UNO);
    expect(arduinoBoards.length).toBeGreaterThan(0);

    const megaBoards = db.getBoardsByType(BoardType.ARDUINO_MEGA_2560);
    expect(megaBoards.length).toBeGreaterThan(0);

    const nanoBoards = db.getBoardsByType(BoardType.ARDUINO_NANO);
    expect(nanoBoards.length).toBeGreaterThan(0);

    const leonardoBoards = db.getBoardsByType(BoardType.ARDUINO_LEONARDO);
    expect(leonardoBoards.length).toBeGreaterThan(0);
  });

  it('should have all required ESP boards', () => {
    const esp32Boards = db.getBoardsByType(BoardType.ESP32);
    expect(esp32Boards.length).toBeGreaterThan(0);

    const esp8266Boards = db.getBoardsByType(BoardType.ESP8266);
    expect(esp8266Boards.length).toBeGreaterThan(0);

    const esp32s2Boards = db.getBoardsByType(BoardType.ESP32_S2);
    expect(esp32s2Boards.length).toBeGreaterThan(0);

    const esp32s3Boards = db.getBoardsByType(BoardType.ESP32_S3);
    expect(esp32s3Boards.length).toBeGreaterThan(0);

    const esp32c3Boards = db.getBoardsByType(BoardType.ESP32_C3);
    expect(esp32c3Boards.length).toBeGreaterThan(0);

    const esp32c6Boards = db.getBoardsByType(BoardType.ESP32_C6);
    expect(esp32c6Boards.length).toBeGreaterThan(0);

    const esp32h2Boards = db.getBoardsByType(BoardType.ESP32_H2);
    expect(esp32h2Boards.length).toBeGreaterThan(0);
  });

  it('should get board by ID', () => {
    const uno = db.getBoard('arduino_uno');
    expect(uno).toBeDefined();
    expect(uno?.id).toBe('arduino_uno');
    expect(uno?.name).toContain('Uno');

    const esp32 = db.getBoard('esp32_devkit');
    expect(esp32).toBeDefined();
    expect(esp32?.id).toBe('esp32_devkit');
  });

  it('should return undefined for non-existent board', () => {
    const board = db.getBoard('non_existent_board');
    expect(board).toBeUndefined();
  });

  it('should get default variant', () => {
    const variant = db.getDefaultVariant('arduino_uno');
    expect(variant).toBeDefined();
    expect(variant?.id).toBe('standard'); // Default variant ID is 'standard'

    const esp32Variant = db.getDefaultVariant('esp32_devkit');
    expect(esp32Variant).toBeDefined();
  });

  it('should get FQBN for board', () => {
    const fqbn = db.getFqbn('arduino_uno');
    expect(fqbn).toBe('arduino:avr:uno');

    const esp32Fqbn = db.getFqbn('esp32_devkit');
    expect(esp32Fqbn).toContain('esp32');
  });

  it('should get PlatformIO board ID', () => {
    const pioBoard = db.getPlatformIOBoard('arduino_uno');
    expect(pioBoard).toBe('uno');

    const esp32Pio = db.getPlatformIOBoard('esp32_devkit');
    expect(esp32Pio).toBe('esp32dev');
  });

  it('should get esptool chip for ESP boards', () => {
    const chip = db.getEsptoolChip('esp32_devkit');
    expect(chip).toBe('esp32');

    const s3Chip = db.getEsptoolChip('esp32_s3');
    expect(s3Chip).toBe('esp32s3');
  });

  it('should detect board by VID/PID', () => {
    // Arduino Uno has unique Arduino VID (2341) - should detect correctly
    const detection = db.detectBoard('/dev/ttyACM0', '2341', '0043');
    expect(detection).toBeDefined();
    expect(detection?.board.id).toBe('arduino_uno');
    // Confidence might be 'medium' because multiple VID/PIDs match
    expect(['high', 'medium']).toContain(detection?.confidence);
    expect(detection?.detectionMethod).toBe('vidpid');

    // ESP boards share VID/PIDs with other boards (CP2102, CH340, FTDI, ESPRESSIF)
    // Detection returns first match - we just verify detection works
    const espDetection = db.detectBoard('/dev/ttyUSB0', '10c4', 'ea60');
    expect(espDetection).toBeDefined();
    expect(espDetection?.detectionMethod).toBe('vidpid');
    // Could be any board with CP2102 (Arduino Uno, ESP32, ESP8266, etc.)
    expect(espDetection?.board).toBeDefined();
  });

  it('should get all boards', () => {
    const allBoards = db.getAllBoards();
    expect(allBoards.length).toBeGreaterThan(10); // Should have at least 10+ boards
  });

  it('should have correct board capabilities', () => {
    const uno = db.getBoard('arduino_uno');
    expect(uno?.capabilities).toBeDefined();
    // BoardCapabilities has wifi/bluetooth, not hasWiFi/hasBluetooth/hasUSB
    expect(uno?.capabilities.wifi).toBe(false);
    expect(uno?.capabilities.bluetooth).toBe(false);

    const esp32 = db.getBoard('esp32_devkit');
    expect(esp32?.capabilities.wifi).toBe(true);
    expect(esp32?.capabilities.bluetooth).toBe(true);
  });
});