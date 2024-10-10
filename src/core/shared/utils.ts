import { Skip } from './types';

/**
 * Represents a file to be skipped.
 */
export function skip(): Skip {
  return {
    _tag: 'Skip',
  };
}

export function isSkip(value: unknown): value is Skip {
  return Object.prototype.hasOwnProperty.call(value, '_tag') && (value as Skip)._tag === 'Skip';
}
