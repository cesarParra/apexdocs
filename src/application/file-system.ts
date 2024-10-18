import * as fs from 'fs';
import { MetadataResolver } from '@salesforce/source-deploy-retrieve';
import { SourceComponentAdapter } from './source-code-file-reader';

export interface FileSystem {
  getComponents(path: string): SourceComponentAdapter[];
  readFile: (path: string) => string;
}

export class DefaultFileSystem implements FileSystem {
  getComponents(path: string): SourceComponentAdapter[] {
    return new MetadataResolver().getComponentsFromPath(path);
  }

  readFile(pathToRead: string): string {
    return fs.readFileSync(pathToRead, 'utf8');
  }
}
