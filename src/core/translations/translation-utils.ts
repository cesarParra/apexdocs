import { Translations, defaultTranslations } from './default-translations';

/**
 * User-provided partial translations that can override the defaults.
 */
export type UserTranslations = DeepPartial<Translations>;

/**
 * Utility type to make all properties in T optional recursively.
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Type representing any object with string keys and unknown values.
 */
type ObjectWithStringKeys = Record<string, unknown>;

/**
 * Merges user-provided translations with the default translations.
 * User translations take precedence over defaults.
 *
 * @param userTranslations - Optional user-provided translations
 * @returns Complete translations object with user overrides applied
 */
export function mergeTranslations(userTranslations?: UserTranslations): Translations {
  if (!userTranslations) {
    return defaultTranslations;
  }

  return JSON.parse(
    JSON.stringify(Object.assign({}, defaultTranslations, deepMerge(defaultTranslations, userTranslations))),
  ) as Translations;
}

/**
 * Type guard to check if a value is a plain object.
 */
function isObjectWithStringKeys(value: unknown): value is ObjectWithStringKeys {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Deep merges two objects, with the second object taking precedence.
 * Both objects must have string keys and unknown values.
 *
 * @param target - The target object (defaults)
 * @param source - The source object (user overrides)
 * @returns Merged object
 */
function deepMerge<T extends ObjectWithStringKeys, U extends ObjectWithStringKeys>(target: T, source: U): T & U {
  const result = { ...target } as T & U;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key as keyof T];

      if (isObjectWithStringKeys(sourceValue) && isObjectWithStringKeys(targetValue)) {
        result[key as keyof (T & U)] = deepMerge(targetValue, sourceValue) as (T & U)[keyof (T & U)];
      } else if (sourceValue !== undefined) {
        result[key as keyof (T & U)] = sourceValue as (T & U)[keyof (T & U)];
      }
    }
  }

  return result;
}

/**
 * Checks if a value is a plain object (not an array or null).
 *
 * @param value - The value to check
 * @returns True if the value is a plain object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Validates that user translations follow the expected structure.
 * This is a basic validation to catch common mistakes.
 *
 * @param userTranslations - User-provided translations
 * @returns True if valid, false otherwise
 */
export function validateUserTranslations(userTranslations: unknown): userTranslations is UserTranslations {
  if (!userTranslations || typeof userTranslations !== 'object') {
    return true; // undefined or null is valid (no overrides)
  }

  if (!isObject(userTranslations)) {
    return false;
  }

  // Basic validation - check that top-level keys are valid
  const validTopLevelKeys: Array<keyof Translations> = ['changelog', 'markdown'];
  const userKeys = Object.keys(userTranslations);

  for (const key of userKeys) {
    if (!validTopLevelKeys.includes(key as keyof Translations)) {
      console.warn(`Invalid translation key: ${key}. Valid keys are: ${validTopLevelKeys.join(', ')}`);
      return false;
    }
  }

  return true;
}
