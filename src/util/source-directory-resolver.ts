import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { getSfdxSourceDirectories } from './sfdx-project-reader';

export type SourceDirectoryResolutionError = {
  readonly _tag: 'SourceDirectoryResolutionError';
  readonly message: string;
  readonly cause?: unknown;
};

/**
 * Creates a SourceDirectoryResolutionError
 */
function createSourceDirectoryResolutionError(message: string, cause?: unknown): SourceDirectoryResolutionError {
  return {
    _tag: 'SourceDirectoryResolutionError',
    message,
    cause,
  };
}

export type SourceDirectoryConfig = {
  sourceDir?: string | string[];
  useSfdxProjectJson?: boolean;
  sfdxProjectPath?: string;
};

/**
 * Resolves source directories from various configuration options
 * @param config - The source directory configuration
 * @returns Either an error or an array of resolved source directory paths
 */
export function resolveSourceDirectories(
  config: SourceDirectoryConfig,
): E.Either<SourceDirectoryResolutionError, string[]> {
  const { sourceDir, useSfdxProjectJson, sfdxProjectPath } = config;

  // Count how many source directory methods are specified
  const hasSourceDir =
    sourceDir && (typeof sourceDir === 'string' || (Array.isArray(sourceDir) && sourceDir.length > 0));
  const methodsSpecified = [hasSourceDir, useSfdxProjectJson].filter(Boolean).length;

  if (methodsSpecified === 0) {
    return E.left(
      createSourceDirectoryResolutionError(
        'No source directory method specified. Must provide one of: sourceDir or useSfdxProjectJson.',
      ),
    );
  }

  if (methodsSpecified > 1) {
    return E.left(
      createSourceDirectoryResolutionError(
        'Multiple source directory methods specified. Only one of sourceDir or useSfdxProjectJson can be used.',
      ),
    );
  }

  // Handle source directory (single or multiple)
  if (sourceDir) {
    if (typeof sourceDir === 'string') {
      return E.right([sourceDir]);
    } else if (Array.isArray(sourceDir)) {
      return E.right(sourceDir);
    }
  }

  // Handle sfdx-project.json
  if (useSfdxProjectJson) {
    const projectPath = sfdxProjectPath || process.cwd();
    return pipe(
      getSfdxSourceDirectories(projectPath),
      E.mapLeft((sfdxError) =>
        createSourceDirectoryResolutionError(
          `Failed to read source directories from sfdx-project.json: ${sfdxError.message}`,
          sfdxError,
        ),
      ),
    );
  }

  return E.left(createSourceDirectoryResolutionError('Invalid source directory configuration.'));
}

/**
 * Validates that the provided source directory configuration is valid
 * @param config - The source directory configuration to validate
 * @returns Either an error or the validated configuration
 */
export function validateSourceDirectoryConfig(
  config: SourceDirectoryConfig,
): E.Either<SourceDirectoryResolutionError, SourceDirectoryConfig> {
  const { sourceDir, useSfdxProjectJson, sfdxProjectPath } = config;

  // Check for conflicting options
  if (sourceDir && useSfdxProjectJson) {
    return E.left(
      createSourceDirectoryResolutionError('Cannot specify both sourceDir and useSfdxProjectJson. Use only one.'),
    );
  }

  // Check for invalid combinations
  if (sfdxProjectPath && !useSfdxProjectJson) {
    return E.left(createSourceDirectoryResolutionError('sfdxProjectPath can only be used with useSfdxProjectJson.'));
  }

  if (Array.isArray(sourceDir) && sourceDir.length === 0) {
    return E.left(
      createSourceDirectoryResolutionError('sourceDir array cannot be empty. Provide at least one directory.'),
    );
  }

  return E.right(config);
}

/**
 * Convenience function for resolving source directories with validation
 * @param config - The source directory configuration
 * @returns Either an error or an array of resolved source directory paths
 */
export function resolveAndValidateSourceDirectories(
  config: SourceDirectoryConfig,
): E.Either<SourceDirectoryResolutionError, string[]> {
  return pipe(validateSourceDirectoryConfig(config), E.flatMap(resolveSourceDirectories));
}
