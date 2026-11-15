"use strict";
/**
 * Utility functions for config manager
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepmerge = deepmerge;
exports.isPlainObject = isPlainObject;
exports.flattenObject = flattenObject;
exports.unflattenObject = unflattenObject;
/**
 * Deep merge two objects
 * Based on deepmerge library but simplified
 */
function deepmerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        const sourceValue = source[key];
        const targetValue = target[key];
        if (sourceValue !== null &&
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue) &&
            targetValue !== null &&
            typeof targetValue === 'object' &&
            !Array.isArray(targetValue)) {
            // Recursively merge objects
            result[key] = deepmerge(targetValue, sourceValue);
        }
        else if (sourceValue !== undefined) {
            // Overwrite with source value
            result[key] = sourceValue;
        }
    }
    return result;
}
/**
 * Check if a value is a plain object
 */
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
/**
 * Flatten object keys with dot notation
 */
function flattenObject(obj, prefix = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (isPlainObject(value)) {
            Object.assign(result, flattenObject(value, newKey));
        }
        else {
            result[newKey] = value;
        }
    }
    return result;
}
/**
 * Unflatten object from dot notation
 */
function unflattenObject(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const keys = key.split('.');
        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i]; // i is guaranteed to be valid index by loop condition
            if (!(k in current) || !isPlainObject(current[k])) {
                current[k] = {};
            }
            current = current[k];
        }
        // keys[keys.length - 1] is guaranteed to exist since keys.length >= 1
        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;
    }
    return result;
}
//# sourceMappingURL=utils.js.map