import * as fs from 'fs';
import * as path from 'path';

import Settings from '../Settings';
import ClassModel from '../Model/ClassModel';
import FileParser from '../Parser/FileParser';

import DocsifyDocsProcessor from '../DocsifyDocsProcessor';
import JekyllDocsProcessor from '../JekyllDocsProcessor';
import AsJsDocsProcessor from '../AsJsDocsProcessor';
import MetadataProcessor from '../MetadataProcessor';

export function generate(
  sourceDirectories: (string | number)[],
  recursive: boolean = true,
  scope: string[] = ['global', 'public', 'namespaceaccessible'],
  outputDir: string = 'docs',
  targetGenerator: string = 'jekyll',
  configPath?: string,
  group?: boolean,
  indexOnly : boolean = false
): ClassModel[] {
  Settings.getInstance().setScope(scope);
  Settings.getInstance().setOutputDir(outputDir);
  Settings.getInstance().setIndexOnly(indexOnly);

  if (targetGenerator === 'jekyll') {
    Settings.getInstance().setDocsProcessor(new JekyllDocsProcessor());
  } else if (targetGenerator === 'docsify') {
    Settings.getInstance().setDocsProcessor(new DocsifyDocsProcessor());
  } else {
    Settings.getInstance().setDocsProcessor(new AsJsDocsProcessor());
  }

  if (group !== undefined) {
    Settings.getInstance().setShouldGroup(group);
  }

  if (configPath) {
    Settings.getInstance().setConfigPath(configPath);
  }

  // TODO: Assert data validation to avoid exposing 'fs' and 'path' errors to callers.
  const classes: ClassModel[] = getClassesFromDirectory(sourceDirectories, recursive);
  // tslint:disable-next-line:no-console
  console.log(`Processed ${classes.length} files`);
  return classes;
}

function getClassesFromDirectory(sourceDirectories: (string | number)[], recursive: boolean) {
  let classes: ClassModel[] = [];

  for (const currentDirectory of sourceDirectories) {
    const sourceDirectory = currentDirectory as string;
    const directoryContents = fs.readdirSync(sourceDirectory);
    directoryContents.forEach(currentFile => {
      const currentPath = path.join(sourceDirectory, currentFile);
      if (recursive && fs.statSync(currentPath).isDirectory()) {
        classes = classes.concat(getClassesFromDirectory([currentPath], recursive));
      }

      if (!currentFile.endsWith('.cls')) {
        return;
      }

      const rawFile = fs.readFileSync(currentPath);
      const response = new FileParser().parseFileContents(rawFile.toString());
      const rawFileMetadata = fs.existsSync(currentPath+'-meta.xml') ? fs.readFileSync(currentPath+'-meta.xml') : null;
      if (!response) {
        return;
      }
      
    
      if(rawFileMetadata != null && response != null){
        let metadataGenericParams = MetadataProcessor.process(rawFileMetadata.toString());
        metadataGenericParams.forEach((value, key) => {
          response.setGeneric(key, value);
        })
      }
  
      if (!response) {
        return;
      }
      classes.push(response);
    });
  }


  return classes;
}
