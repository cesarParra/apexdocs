import { ApexFileReader } from '../apex-file-reader';
import { FileSystem } from '../file-system';

type File = {
  type: 'file';
  path: string;
  content: string;
};

type Directory = {
  type: 'directory';
  path: string;
  files: (File | Directory)[];
};

type Path = File | Directory;

class TestFileSystem implements FileSystem {
  constructor(private readonly paths: Path[]) {}

  async isDirectory(path: string): Promise<boolean> {
    const directory = this.findPath(path);
    return directory ? directory.type === 'directory' : false;
  }

  joinPath(...paths: string[]): string {
    return paths.join('/');
  }

  async readDirectory(sourceDirectory: string): Promise<string[]> {
    const directory = this.findPath(sourceDirectory);
    if (!directory || directory.type !== 'directory') {
      throw new Error('Directory not found');
    }
    return directory.files.map((f) => f.path);
  }

  async readFile(path: string): Promise<string> {
    const file = this.findPath(path);
    if (!file || file.type !== 'file') {
      throw new Error('File not found');
    }
    return file.content;
  }

  exists(path: string): boolean {
    return this.paths.some((p) => p.path === path);
  }

  findPath(path: string): Path | undefined {
    const splitPath = path.split('/');
    let currentPath = this.paths.find((p) => p.path === splitPath[0]);
    for (let i = 1; i < splitPath.length; i++) {
      if (!currentPath || currentPath.type !== 'directory') {
        return undefined;
      }
      currentPath = currentPath.files.find((f) => f.path === splitPath[i]);
    }
    return currentPath;
  }
}

describe('File Reader', () => {
  it('returns an empty list when there are no files in the directory', async () => {
    const fileSystem = new TestFileSystem([
      {
        type: 'directory',
        path: '',
        files: [],
      },
    ]);

    const result = await ApexFileReader.processFiles(fileSystem, '', false);

    expect(result.length).toBe(0);
  });

  it('returns an empty list when there are no Apex files in the directory', async () => {
    const fileSystem = new TestFileSystem([
      {
        type: 'directory',
        path: '',
        files: [
          {
            type: 'file',
            path: 'SomeFile.md',
            content: '## Some Markdown',
          },
        ],
      },
    ]);

    const result = await ApexFileReader.processFiles(fileSystem, '', false);
    expect(result.length).toBe(0);
  });

  it('returns the file contents for all Apex files', async () => {
    const fileSystem = new TestFileSystem([
      {
        type: 'directory',
        path: '',
        files: [
          {
            type: 'file',
            path: 'SomeFile.cls',
            content: 'public class MyClass{}',
          },
          {
            type: 'directory',
            path: 'subdir',
            files: [
              {
                type: 'file',
                path: 'AnotherFile.cls',
                content: 'public class AnotherClass{}',
              },
            ],
          },
        ],
      },
    ]);

    const result = await ApexFileReader.processFiles(fileSystem, '', false);
    expect(result.length).toBe(2);
    expect(result[0].content).toBe('public class MyClass{}');
    expect(result[1].content).toBe('public class AnotherClass{}');
  });
});
