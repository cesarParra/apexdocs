import { Settings } from '../../settings';
import { FileSystem } from '../file-system';
import { ApexFileReader } from '../apex-file-reader';

describe('File Reader', () => {
  beforeEach(() => {
    Settings.build({
      sourceDirectory: '',
      recursive: true,
      configPath: '',
      targetGenerator: 'jekyll',
      group: true,
      outputDir: '',
      scope: [],
    });
  });

  it('returns an empty list when there are no files in the directory', () => {
    const result = ApexFileReader.processFiles({
      isDirectory(path: string): boolean {
        return false;
      },
      joinPath(paths: string): string {
        return '';
      },
      readDirectory(sourceDirectory: string): string[] {
        return [];
      },
      readFile(path: string): string {
        return '';
      },
    });
    expect(result.length).toBe(0);
  });

  it('returns an empty list when there are no Apex files in the directory', () => {
    const result = ApexFileReader.processFiles({
      isDirectory(path: string): boolean {
        return false;
      },
      joinPath(paths: string): string {
        return '';
      },
      readDirectory(sourceDirectory: string): string[] {
        return ['SomeFile.md'];
      },
      readFile(path: string): string {
        return '';
      },
    });
    expect(result.length).toBe(0);
  });

  it('returns the file contents for an Apex file', () => {
    const result = ApexFileReader.processFiles({
      isDirectory(path: string): boolean {
        return false;
      },
      joinPath(paths: string): string {
        return '';
      },
      readDirectory(sourceDirectory: string): string[] {
        return ['SomeApexFile.cls'];
      },
      readFile(path: string): string {
        return 'public class MyClass{}';
      },
    });
    expect(result.length).toBe(1);
    expect(result[0]).toBe('public class MyClass{}');
  });
});
