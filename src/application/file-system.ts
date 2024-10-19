import * as fs from 'fs';
import { MetadataResolver } from '@salesforce/source-deploy-retrieve';
import { SourceComponentAdapter } from './source-code-file-reader';
import { pipe } from 'fp-ts/function';

export interface FileSystem {
  getComponents(path: string): SourceComponentAdapter[];
  readFile: (path: string) => string;
}

export class DefaultFileSystem implements FileSystem {
  getComponents(path: string): SourceComponentAdapter[] {
    const components = new MetadataResolver().getComponentsFromPath(path);

    const fieldComponents = pipe(
      components,
      (components) => components.filter((component) => component.type.name === 'CustomObject'),
      (components) => components.map((component) => component.content),
      (contents) => contents.filter((content) => content !== undefined),
      (contents) => contents.map((content) => `${content}/fields`),
      (potentialFieldLocations) =>
        potentialFieldLocations.map((potentialFieldLocation) =>
          new MetadataResolver().getComponentsFromPath(potentialFieldLocation),
        ),
      (fieldComponents) => fieldComponents.flat(),
      (fieldComponents) => fieldComponents.filter((fieldComponent) => fieldComponent.type.name === 'CustomField'),
    );

    return [...components, ...fieldComponents];
  }

  readFile(pathToRead: string): string {
    return fs.readFileSync(pathToRead, 'utf8');
  }
}
