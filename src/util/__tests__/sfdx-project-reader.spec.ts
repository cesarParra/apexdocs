import * as fs from 'fs';
import * as path from 'path';
import * as E from 'fp-ts/Either';
import { readSfdxProjectConfig, getSfdxSourceDirectories, getSfdxDefaultSourceDirectory } from '../sfdx-project-reader';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('sfdx-project-reader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readSfdxProjectConfig', () => {
    it('should read and parse a valid sfdx-project.json file', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: [
          { path: 'force-app', default: true },
          { path: 'force-lwc', default: false },
        ],
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = readSfdxProjectConfig(projectRoot);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.packageDirectories).toHaveLength(2);
        expect(result.right.packageDirectories[0].path).toBe('force-app');
        expect(result.right.packageDirectories[0].default).toBe(true);
        expect(result.right.packageDirectories[1].path).toBe('force-lwc');
        expect(result.right.packageDirectories[1].default).toBe(false);
      }

      expect(mockFs.existsSync).toHaveBeenCalledWith(path.join(projectRoot, 'sfdx-project.json'));
      expect(mockFs.readFileSync).toHaveBeenCalledWith(path.join(projectRoot, 'sfdx-project.json'), 'utf8');
    });

    it('should return an error when sfdx-project.json does not exist', () => {
      const projectRoot = '/test/project';

      mockFs.existsSync.mockReturnValue(false);

      const result = readSfdxProjectConfig(projectRoot);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SfdxProjectReadError');
        expect(result.left.message).toContain('Failed to read sfdx-project.json');
        expect(result.left.message).toContain('not found');
      }
    });

    it('should return an error when sfdx-project.json contains invalid JSON', () => {
      const projectRoot = '/test/project';
      const invalidJson = '{ "packageDirectories": [ invalid json }';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(invalidJson);

      const result = readSfdxProjectConfig(projectRoot);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SfdxProjectReadError');
        expect(result.left.message).toContain('Failed to parse sfdx-project.json');
      }
    });

    it('should return an error when packageDirectories is missing', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        someOtherProperty: 'value',
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = readSfdxProjectConfig(projectRoot);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SfdxProjectReadError');
        expect(result.left.message).toContain('does not contain a valid packageDirectories array');
      }
    });

    it('should return an error when packageDirectories is not an array', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: 'not-an-array',
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = readSfdxProjectConfig(projectRoot);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SfdxProjectReadError');
        expect(result.left.message).toContain('does not contain a valid packageDirectories array');
      }
    });
  });

  describe('getSfdxSourceDirectories', () => {
    it('should return absolute paths by default', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: [
          { path: 'force-app', default: true },
          { path: 'force-lwc', default: false },
          { path: 'force-obj', default: false },
        ],
      });

      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        return (
          pathStr.endsWith('sfdx-project.json') ||
          pathStr.endsWith('force-app') ||
          pathStr.endsWith('force-lwc') ||
          pathStr.endsWith('force-obj')
        );
      });
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = getSfdxSourceDirectories(projectRoot);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toHaveLength(3);
        expect(result.right[0]).toBe(path.resolve(projectRoot, 'force-app'));
        expect(result.right[1]).toBe(path.resolve(projectRoot, 'force-lwc'));
        expect(result.right[2]).toBe(path.resolve(projectRoot, 'force-obj'));
      }
    });

    it('should return relative paths when absolutePaths is false', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: [
          { path: 'force-app', default: true },
          { path: 'force-lwc', default: false },
        ],
      });

      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        return pathStr.endsWith('sfdx-project.json') || pathStr.includes('force-');
      });
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = getSfdxSourceDirectories(projectRoot, false);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toHaveLength(2);
        expect(result.right[0]).toBe('force-app');
        expect(result.right[1]).toBe('force-lwc');
      }
    });

    it('should return an error when a package directory does not exist', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: [
          { path: 'force-app', default: true },
          { path: 'non-existent-dir', default: false },
        ],
      });

      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        return pathStr.endsWith('sfdx-project.json') || pathStr.endsWith('force-app');
      });
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = getSfdxSourceDirectories(projectRoot);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SfdxProjectReadError');
        expect(result.left.message).toContain('package directories do not exist');
        expect(result.left.message).toContain('non-existent-dir');
      }
    });

    it('should propagate errors from reading sfdx-project.json', () => {
      const projectRoot = '/test/project';

      mockFs.existsSync.mockReturnValue(false);

      const result = getSfdxSourceDirectories(projectRoot);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SfdxProjectReadError');
        expect(result.left.message).toContain('Failed to read sfdx-project.json');
      }
    });
  });

  describe('getSfdxDefaultSourceDirectory', () => {
    it('should return the default directory when one is specified', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: [
          { path: 'force-app', default: true },
          { path: 'force-lwc', default: false },
        ],
      });

      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        return pathStr.endsWith('sfdx-project.json') || pathStr.endsWith('force-app');
      });
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = getSfdxDefaultSourceDirectory(projectRoot);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(path.resolve(projectRoot, 'force-app'));
      }
    });

    it('should return relative path when absolutePath is false', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: [
          { path: 'force-app', default: true },
          { path: 'force-lwc', default: false },
        ],
      });

      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        return pathStr.endsWith('sfdx-project.json') || pathStr.endsWith('force-app');
      });
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = getSfdxDefaultSourceDirectory(projectRoot, false);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe('force-app');
      }
    });

    it('should return undefined when no default directory is specified', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: [
          { path: 'force-app', default: false },
          { path: 'force-lwc', default: false },
        ],
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = getSfdxDefaultSourceDirectory(projectRoot);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBeUndefined();
      }
    });

    it('should return undefined when no default property is specified on any directory', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: [{ path: 'force-app' }, { path: 'force-lwc' }],
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = getSfdxDefaultSourceDirectory(projectRoot);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBeUndefined();
      }
    });

    it('should return an error when the default directory does not exist', () => {
      const projectRoot = '/test/project';
      const sfdxProjectContent = JSON.stringify({
        packageDirectories: [
          { path: 'non-existent-dir', default: true },
          { path: 'force-lwc', default: false },
        ],
      });

      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        const pathStr = filePath.toString();
        return pathStr.endsWith('sfdx-project.json');
      });
      mockFs.readFileSync.mockReturnValue(sfdxProjectContent);

      const result = getSfdxDefaultSourceDirectory(projectRoot);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SfdxProjectReadError');
        expect(result.left.message).toContain('Default package directory does not exist');
        expect(result.left.message).toContain('non-existent-dir');
      }
    });

    it('should propagate errors from reading sfdx-project.json', () => {
      const projectRoot = '/test/project';

      mockFs.existsSync.mockReturnValue(false);

      const result = getSfdxDefaultSourceDirectory(projectRoot);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left._tag).toBe('SfdxProjectReadError');
        expect(result.left.message).toContain('Failed to read sfdx-project.json');
      }
    });
  });
});
