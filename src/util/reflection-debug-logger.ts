import type { Logger } from './logger';
import { noopReflectionDebugLogger, type ReflectionDebugLogger } from '../core/reflection/apex/reflect-apex-source';

export function createReflectionDebugLogger(logger: Logger): ReflectionDebugLogger {
  if (!logger.isDebugEnabled()) {
    return noopReflectionDebugLogger;
  }

  return {
    onStart: (filePath: string) => {
      logger.debug(`Parsing: ${filePath}...`);
    },
    onSuccess: (filePath: string) => {
      logger.debug(`Parsing: ${filePath} OK`);
    },
    onFailure: (filePath: string, errorMessage: string) => {
      logger.debug(`Parsing: ${filePath} FAILED`);
      logger.debug(`Parsing error: ${filePath} - ${errorMessage}`);
    },
  };
}
