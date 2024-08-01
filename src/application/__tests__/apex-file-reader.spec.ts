import { Settings, SettingsConfig } from '../../core/settings';
import { ApexFileReader } from '../apex-file-reader';

describe('File Reader', () => {
  beforeEach(() => {
    Settings.build({
      sourceDirectory: '',
      recursive: true,
      scope: [],
      outputDir: '',
      targetGenerator: 'plain-markdown',
      indexOnly: false,
      defaultGroupName: 'Misc',
      sanitizeHtml: true,
      openApiFileName: 'openapi',
      title: 'Classes',
      includeMetadata: false,
    } as SettingsConfig);
  });

  it('returns an empty list when there are no files in the directory', () => {
    const result = ApexFileReader.processFiles({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isDirectory(_: string): boolean {
        return false;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      joinPath(_: string): string {
        return '';
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      readDirectory(_: string): string[] {
        return [];
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      readFile(_: string): string {
        return '';
      },
      exists(): boolean {
        return true;
      },
    });
    expect(result.length).toBe(0);
  });

  it('returns an empty list when there are no Apex files in the directory', () => {
    const result = ApexFileReader.processFiles({
      isDirectory(): boolean {
        return false;
      },
      joinPath(): string {
        return '';
      },
      readDirectory(): string[] {
        return ['SomeFile.md'];
      },
      readFile(): string {
        return '';
      },
      exists(): boolean {
        return true;
      },
    });
    expect(result.length).toBe(0);
  });

  it('returns the file contents for an Apex file', () => {
    const result = ApexFileReader.processFiles({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isDirectory(_: string): boolean {
        return false;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      joinPath(_: string): string {
        return '';
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      readDirectory(_: string): string[] {
        return ['SomeApexFile.cls'];
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      readFile(_: string): string {
        return 'public class MyClass{}';
      },
      exists(): boolean {
        return true;
      },
    });
    expect(result.length).toBe(1);
    expect(result[0].content).toBe('public class MyClass{}');
  });
});
