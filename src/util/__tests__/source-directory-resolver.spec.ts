import * as E from 'fp-ts/Either';
import {
  resolveSourceDirectories,
  validateSourceDirectoryConfig,
  resolveAndValidateSourceDirectories,
  SourceDirectoryConfig,
} from '../source-directory-resolver';
import { getSfdxSourceDirectories } from '../sfdx-project-reader';

// Mock the sfdx-project-reader module
jest.mock('../sfdx-project-reader');
const mockGetSfdxSourceDirectories = getSfdxSourceDirectories as jest.MockedFunction<typeof getSfdxSourceDirectories>;

describe('source-directory-resolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process.cwd()
    jest.spyOn(process, 'cwd').mockReturnValue('/current/working/directory');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('resolveSourceDirectories', () => {
    it('should resolve a single source directory', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: 'force-app',
      };

      const result = resolveSourceDirectories(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(['force-app']);
      }
    });

    it('should resolve multiple source directories', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: ['force-app', 'force-lwc', 'force-obj'],
      };

      const result = resolveSourceDirectories(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(['force-app', 'force-lwc', 'force-obj']);
      }
    });

    it('should resolve directories from sfdx-project.json using current working directory', () => {
      const config: SourceDirectoryConfig = {
        useSfdxProjectJson: true,
      };

      const mockDirectories = ['/project/force-app', '/project/force-lwc'];
      mockGetSfdxSourceDirectories.mockReturnValue(E.right(mockDirectories));

      const result = resolveSourceDirectories(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockDirectories);
      }
      expect(mockGetSfdxSourceDirectories).toHaveBeenCalledWith('/current/working/directory');
    });

    it('should resolve directories from sfdx-project.json using specified path', () => {
      const config: SourceDirectoryConfig = {
        useSfdxProjectJson: true,
        sfdxProjectPath: '/custom/project/path',
      };

      const mockDirectories = ['/custom/project/path/force-app', '/custom/project/path/force-lwc'];
      mockGetSfdxSourceDirectories.mockReturnValue(E.right(mockDirectories));

      const result = resolveSourceDirectories(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockDirectories);
      }
      expect(mockGetSfdxSourceDirectories).toHaveBeenCalledWith('/custom/project/path');
    });

    it('should return an error when no source directory method is specified', () => {
      const config: SourceDirectoryConfig = {};

      const result = resolveSourceDirectories(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('No source directory method specified');
      }
    });

    it('should return an error when multiple source directory methods are specified', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: 'force-app',
        useSfdxProjectJson: true,
      };

      const result = resolveSourceDirectories(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('Multiple source directory methods specified');
      }
    });

    it('should return an error when sourceDir and useSfdxProjectJson are both specified', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: 'force-app',
        useSfdxProjectJson: true,
      };

      const result = resolveSourceDirectories(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('Multiple source directory methods specified');
      }
    });

    it('should handle empty sourceDir array', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: [],
      };

      const result = resolveSourceDirectories(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('No source directory method specified');
      }
    });

    it('should propagate errors from sfdx-project.json reading', () => {
      const config: SourceDirectoryConfig = {
        useSfdxProjectJson: true,
      };

      const mockError = {
        _tag: 'SfdxProjectReadError' as const,
        message: 'Failed to read sfdx-project.json',
      };
      mockGetSfdxSourceDirectories.mockReturnValue(E.left(mockError));

      const result = resolveSourceDirectories(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('Failed to read source directories from sfdx-project.json');
        expect(result.left.message).toContain('Failed to read sfdx-project.json');
        expect(result.left.cause).toBe(mockError);
      }
    });
  });

  describe('validateSourceDirectoryConfig', () => {
    it('should validate a valid single source directory config', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: 'force-app',
      };

      const result = validateSourceDirectoryConfig(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(config);
      }
    });

    it('should validate a valid multiple source directories config', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: ['force-app', 'force-lwc'],
      };

      const result = validateSourceDirectoryConfig(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(config);
      }
    });

    it('should validate a valid sfdx-project.json config', () => {
      const config: SourceDirectoryConfig = {
        useSfdxProjectJson: true,
        sfdxProjectPath: '/custom/path',
      };

      const result = validateSourceDirectoryConfig(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(config);
      }
    });

    it('should return an error when sourceDir and useSfdxProjectJson are both specified', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: 'force-app',
        useSfdxProjectJson: true,
      };

      const result = validateSourceDirectoryConfig(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('Cannot specify both sourceDir and useSfdxProjectJson');
      }
    });

    it('should return an error when sfdxProjectPath is specified without useSfdxProjectJson', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: 'force-app',
        sfdxProjectPath: '/path/to/project',
      };

      const result = validateSourceDirectoryConfig(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('sfdxProjectPath can only be used with useSfdxProjectJson');
      }
    });

    it('should return an error when sourceDir is an empty array', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: [],
      };

      const result = validateSourceDirectoryConfig(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('sourceDir array cannot be empty');
      }
    });

    it('should validate an empty config', () => {
      const config: SourceDirectoryConfig = {};

      const result = validateSourceDirectoryConfig(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(config);
      }
    });
  });

  describe('resolveAndValidateSourceDirectories', () => {
    it('should successfully resolve and validate a valid config', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: 'force-app',
      };

      const result = resolveAndValidateSourceDirectories(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(['force-app']);
      }
    });

    it('should return validation errors first', () => {
      const config: SourceDirectoryConfig = {
        sourceDir: 'force-app',
        useSfdxProjectJson: true,
      };

      const result = resolveAndValidateSourceDirectories(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('Cannot specify both sourceDir and useSfdxProjectJson');
      }
    });

    it('should return resolution errors when validation passes but resolution fails', () => {
      const config: SourceDirectoryConfig = {
        useSfdxProjectJson: true,
      };

      const mockError = {
        _tag: 'SfdxProjectReadError' as const,
        message: 'Failed to read sfdx-project.json',
      };
      mockGetSfdxSourceDirectories.mockReturnValue(E.left(mockError));

      const result = resolveAndValidateSourceDirectories(config);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SourceDirectoryResolutionError');
        expect(result.left.message).toContain('Failed to read source directories from sfdx-project.json');
      }
    });

    it('should handle successful sfdx-project.json resolution', () => {
      const config: SourceDirectoryConfig = {
        useSfdxProjectJson: true,
      };

      const mockDirectories = ['/project/force-app', '/project/force-lwc'];
      mockGetSfdxSourceDirectories.mockReturnValue(E.right(mockDirectories));

      const result = resolveAndValidateSourceDirectories(config);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockDirectories);
      }
    });
  });
});
