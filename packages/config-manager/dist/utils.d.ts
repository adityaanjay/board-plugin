/**
 * Utility functions for config manager
 */
/**
 * Deep merge two objects
 * Based on deepmerge library but simplified
 */
export declare function deepmerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T;
/**
 * Check if a value is a plain object
 */
export declare function isPlainObject(value: unknown): value is Record<string, unknown>;
/**
 * Flatten object keys with dot notation
 */
export declare function flattenObject(obj: Record<string, unknown>, prefix?: string): Record<string, unknown>;
/**
 * Unflatten object from dot notation
 */
export declare function unflattenObject(obj: Record<string, unknown>): Record<string, unknown>;
//# sourceMappingURL=utils.d.ts.map