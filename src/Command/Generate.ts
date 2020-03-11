import * as fs from 'fs';
import * as path from 'path';

import Settings from '../Settings';
import ClassModel from '../model/ClassModel';
import FileParser from '../parser/FileParser';

import DocsifyDocsProcessor from '../DocsifyDocsProcessor';
import JekyllDocsProcessor from '../JekyllDocsProcessor';

export function generate(
  sourceDirectory: string,
  recursive: boolean = true,
  scope: string[] = ['global', 'public'],
  outputDir: string = 'docs',
  targetGenerator: string = 'jekyll',
  configPath?: string,
  group?: boolean,
): ClassModel[] {
  Settings.getInstance().setScope(scope);
  Settings.getInstance().setOutputDir(outputDir);

  if (targetGenerator === 'jekyll') {
    Settings.getInstance().setDocsProcessor(new JekyllDocsProcessor());
  } else {
    Settings.getInstance().setDocsProcessor(new DocsifyDocsProcessor());
  }

  if (group !== undefined) {
    Settings.getInstance().setShouldGroup(group);
  }

  if (configPath) {
    Settings.getInstance().setConfigPath(configPath);
  }

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
