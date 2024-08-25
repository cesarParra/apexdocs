import { OpenApiSettings, SettingsConfig } from '../../core/openApiSettings';
import { ApexFileReader } from '../apex-file-reader';

describe('File Reader', () => {
  beforeEach(() => {
    OpenApiSettings.build({
      sourceDirectory: '',
      recursive: true,
      scope: [],
      outputDir: '',
      targetGenerator: 'markdown',
      indexOnly: false,
      defaultGroupName: 'Misc',
      sanitizeHtml: true,
      openApiFileName: 'openapi',
      title: 'Classes',
      includeMetadata: false,
    } as SettingsConfig);
  });

  it('returns an empty list when there are no files in the directory', async () => {
    const result = await ApexFileReader.processFiles(
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        isDirectory(_: string): Promise<boolean> {
          return Promise.resolve(false);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        joinPath(_: string): string {
          return '';
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        readDirectory(_: string): Promise<string[]> {
          return Promise.resolve([]);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        readFile(_: string): Promise<string> {
          return Promise.resolve('');
        },
        exists(): boolean {
          return true;
        },
      },
      '',
      false,
    );
    expect(result.length).toBe(0);
  });

  it('returns an empty list when there are no Apex files in the directory', async () => {
    const result = await ApexFileReader.processFiles(
      {
        isDirectory(): Promise<boolean> {
          return Promise.resolve(false);
        },
        joinPath(): string {
          return '';
        },
        readDirectory(): Promise<string[]> {
          return Promise.resolve(['SomeFile.md']);
        },
        readFile(): Promise<string> {
          return Promise.resolve('');
        },
        exists(): boolean {
          return true;
        },
      },
      '',
      false,
    );
    expect(result.length).toBe(0);
  });

  it('returns the file contents for an Apex file', async () => {
    const result = await ApexFileReader.processFiles(
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        isDirectory(_: string): Promise<boolean> {
          return Promise.resolve(false);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        joinPath(_: string): string {
          return 'SomeApexFile.cls';
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        readDirectory(_: string): Promise<string[]> {
          return Promise.resolve(['SomeApexFile.cls']);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        readFile(_: string): Promise<string> {
          return Promise.resolve('public class MyClass{}');
        },
        exists(): boolean {
          return true;
        },
      },
      '',
      false,
    );
    expect(result.length).toBe(1);
    expect(result[0].content).toBe('public class MyClass{}');
  });
});
