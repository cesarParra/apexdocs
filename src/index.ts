#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

import Scope from './Scope';
import ClassModel from './Model/ClassModel';
import FileParser from './Parser/FileParser';

export function generate(
  sourceDirectory: string,
  recursive: boolean = true,
  scope: string[] = ['global', 'public'],
): ClassModel[] {
  Scope.getInstance().set(scope);
  const classes: ClassModel[] = getClassesFromDirectory(sourceDirectory, recursive);
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

    let rawFile = fs.readFileSync(currentPath);
    let response = new FileParser().parseFileContents(rawFile.toString());
    if (!response) {
      return;
    }
    classes.push(response);
  });
  return classes;
}

generate('apex');
