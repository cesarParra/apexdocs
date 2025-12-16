import * as fs from 'fs';
import { MetadataResolver } from '@salesforce/source-deploy-retrieve';
import { SourceComponentAdapter } from './source-code-file-reader';
import { pipe } from 'fp-ts/function';
import * as nodePath from 'path';

export interface FileSystem {
  getComponents(path: string): SourceComponentAdapter[];
  readFile: (path: string) => string | null;
}

export class DefaultFileSystem implements FileSystem {
  getComponents(path: string): SourceComponentAdapter[] {
    const components = new MetadataResolver().getComponentsFromPath(path);

    const fieldComponents = pipe(
      components,
      (components) => components.filter((component) => component.type.name === 'CustomObject'),
      (components) => components.map((component) => component.content),
      (contents) => contents.filter((content) => content !== undefined),
      (contents) => contents.map((content) => nodePath.join(content!, 'fields')),
      (potentialFieldLocations) =>
        potentialFieldLocations.filter((potentialFieldLocation) => fs.existsSync(potentialFieldLocation)),
      (potentialFieldLocations) =>
        potentialFieldLocations.map((potentialFieldLocation) =>
          new MetadataResolver().getComponentsFromPath(potentialFieldLocation),
        ),
      (fieldComponents) => fieldComponents.flat(),
      (fieldComponents) => fieldComponents.filter((fieldComponent) => fieldComponent.type.name === 'CustomField'),
    );

    return [...components, ...fieldComponents];
  }

  readFile(pathToRead: string): string | null {
    try {
      return fs.readFileSync(pathToRead, 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }
}
