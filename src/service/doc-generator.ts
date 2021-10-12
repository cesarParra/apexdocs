import * as fs from 'fs';
import * as path from 'path';
import { reflect, Type } from '@cparra/apex-reflection';

import { Settings } from '../Settings';
import { Logger } from '../util/logger';

// TODO: We want to add the functionality to create a MANIFEST
// TODO: We want to add some kind of DIFF support
// TODO: README updates
// TODO: Rename files to not start with an uppercase letter

export function generateDocs(): Type[] {
  const parsedTypes: Type[] = processFiles(Settings.getInstance().sourceDirectory, Settings.getInstance().recursive);
  Logger.log(`Processed ${parsedTypes.length} files`);
  return parsedTypes;
}

function processFiles(sourceDirectory: string, recursive: boolean) {
  let types: Type[] = [];

  const directoryContents = fs.readdirSync(sourceDirectory);
  directoryContents.forEach(currentFile => {
    const currentPath = path.join(sourceDirectory, currentFile);
    if (recursive && fs.statSync(currentPath).isDirectory()) {
      types = types.concat(processFiles(currentPath, recursive));
    }

    if (!currentFile.endsWith('.cls')) {
      return;
    }

    const rawFile = fs.readFileSync(currentPath);
    const response = reflect(rawFile.toString());
    if (!response.typeMirror) {
      Logger.log(`Parsing error ${response.error?.message}`);
      return;
    }
    types.push(response.typeMirror);
  });
  return types;
}
