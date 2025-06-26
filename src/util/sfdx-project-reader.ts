import * as fs from 'fs';
import * as path from 'path';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

export type SfdxProjectConfig = {
  packageDirectories: Array<{
    path: string;
    default?: boolean;
  }>;
};

export type SfdxProjectReadError = {
  readonly _tag: 'SfdxProjectReadError';
  readonly message: string;
  readonly cause?: unknown;
};

/**
 * Creates an SfdxProjectReadError
 */
function createSfdxProjectReadError(message: string, cause?: unknown): SfdxProjectReadError {
  return {
    _tag: 'SfdxProjectReadError',
    message,
    cause,
  };
}

/**
 * Reads and parses the sfdx-project.json file from the given directory
 * @param projectRoot - The root directory where sfdx-project.json should be located
 * @returns Either an error or the parsed sfdx-project.json configuration
 */
export function readSfdxProjectConfig(projectRoot: string): E.Either<SfdxProjectReadError, SfdxProjectConfig> {
  const sfdxProjectPath = path.join(projectRoot, 'sfdx-project.json');

  return pipe(
    E.tryCatch(
      () => {
        if (!fs.existsSync(sfdxProjectPath)) {
          throw new Error(`sfdx-project.json not found at ${sfdxProjectPath}`);
        }
        return fs.readFileSync(sfdxProjectPath, 'utf8');
      },
      (error) => createSfdxProjectReadError(`Failed to read sfdx-project.json: ${error}`, error),
    ),
    E.flatMap((content) =>
      E.tryCatch(
        () => JSON.parse(content) as SfdxProjectConfig,
        (error) => createSfdxProjectReadError(`Failed to parse sfdx-project.json: ${error}`, error),
      ),
    ),
    E.flatMap((config) => {
      if (!config.packageDirectories || !Array.isArray(config.packageDirectories)) {
        return E.left(
          createSfdxProjectReadError('sfdx-project.json does not contain a valid packageDirectories array'),
        );
      }
      return E.right(config);
    }),
  );
}

/**
 * Extracts the source directory paths from the sfdx-project.json configuration
 * @param projectRoot - The root directory where sfdx-project.json is located
 * @param absolutePaths - Whether to return absolute paths (default: true)
 * @returns Either an error or an array of directory paths
 */
export function getSfdxSourceDirectories(
  projectRoot: string,
  absolutePaths: boolean = true,
): E.Either<SfdxProjectReadError, string[]> {
  return pipe(
    readSfdxProjectConfig(projectRoot),
    E.map((config) => config.packageDirectories.map((dir) => dir.path)),
    E.map((paths) => {
      if (absolutePaths) {
        return paths.map((dirPath) => path.resolve(projectRoot, dirPath));
      }
      return paths;
    }),
    E.flatMap((paths) => {
      // Validate that all paths exist
      const nonExistentPaths = paths.filter((dirPath) => !fs.existsSync(dirPath));
      if (nonExistentPaths.length > 0) {
        return E.left(
          createSfdxProjectReadError(
            `The following package directories do not exist: ${nonExistentPaths.join(', ')}`,
          ),
        );
      }
      return E.right(paths);
    }),
  );
}

/**
 * Gets the default source directory from the sfdx-project.json configuration
 * @param projectRoot - The root directory where sfdx-project.json is located
 * @param absolutePath - Whether to return an absolute path (default: true)
 * @returns Either an error or the default directory path, or undefined if no default is specified
 */
export function getSfdxDefaultSourceDirectory(
  projectRoot: string,
  absolutePath: boolean = true,
): E.Either<SfdxProjectReadError, string | undefined> {
  return pipe(
    readSfdxProjectConfig(projectRoot),
    E.map((config) => {
      const defaultDir = config.packageDirectories.find((dir) => dir.default === true);
      if (!defaultDir) {
        return undefined;
      }
      return absolutePath ? path.resolve(projectRoot, defaultDir.path) : defaultDir.path;
    }),
    E.flatMap((defaultPath) => {
      if (defaultPath && !fs.existsSync(defaultPath)) {
        return E.left(createSfdxProjectReadError(`Default package directory does not exist: ${defaultPath}`));
      }
      return E.right(defaultPath);
    }),
  );
}
