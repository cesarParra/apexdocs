import * as fs from 'fs';
import * as path from 'path';

import Settings from '../Settings';
import ClassModel from '../model/ClassModel';
import FileParser from '../parser/FileParser';

export function generate(
  sourceDirectory: string,
  recursive: boolean = true,
  scope: string[] = ['global', 'public'],
  outputDir: string = 'docs',
  targetGenerator: string = 'jekyll',
): ClassModel[] {
  Settings.getInstance().setScope(scope);
  Settings.getInstance().setOutputDir(outputDir);
  Settings.getInstance().setGenerator(targetGenerator);

  // TODO: Assert data validation to avoid exposing 'fs' and 'path' errors to callers.
  const classes: ClassModel[] = getClassesFromDirectory(sourceDirectory, recursive);
  // tslint:disable-next-line:no-console
  console.log(`Processed ${classes.length} files`);
  return classes;
}

function getClassesFromDirectory(sourceDirectory: string, recursive: boolean) {
  let classes: ClassModel[] = [];

  const directoryContents = fs.readdirSync(sourceDirectory);
  directoryContents.forEach(currentFile => {
    const currentPath = path.join(sourceDirectory, currentFile);
    if (recursive && fs.statSync(currentPath).isDirectory()) {
      classes = classes.concat(getClassesFromDirectory(currentPath, recursive));
    }

    if (!currentFile.endsWith('.cls')) {
      return;
    }

    const rawFile = fs.readFileSync(currentPath);
    const response = new FileParser().parseFileContents(rawFile.toString());
    if (!response) {
      return;
    }
    classes.push(response);
  });
  return classes;
}
