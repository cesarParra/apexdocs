import type { Logger } from './logger';
import { noopReflectionDebugLogger, type ReflectionDebugLogger } from '../core/reflection/apex/reflect-apex-source';

type FailureRecorder = (filePath: string, errorMessage: string) => void;

export function createReflectionDebugLogger(logger: Logger, recordFailure?: FailureRecorder): ReflectionDebugLogger {
  if (!logger.isDebugEnabled() && !recordFailure) {
    return noopReflectionDebugLogger;
  }

  return {
    onStart: (filePath: string) => {
      if (logger.isDebugEnabled()) {
        logger.debug(`Parsing: ${filePath}...`);
      }
    },
    onSuccess: (filePath: string) => {
      if (logger.isDebugEnabled()) {
        logger.debug(`Parsing: ${filePath} OK`);
      }
    },
    onFailure: (filePath: string, errorMessage: string) => {
      if (logger.isDebugEnabled()) {
        logger.debug(`Parsing: ${filePath} FAILED`);
        logger.debug(`Parsing error: ${filePath} - ${errorMessage}`);
      }
      recordFailure?.(filePath, errorMessage);
    },
  };
}
