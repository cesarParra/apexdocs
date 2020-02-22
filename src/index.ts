#!/usr/bin/env node

import * as shell from 'shelljs';

import ClassModel from './ClassModel';
import MethodModel from './MethodModel';
import PropertyModel from './PropertyModel';
import FileManager from './FileManager';
import { peek } from './utils';

var rgstrScope = ['public'];

function document() {
  let sourceDirectory = 'apex/';
  let targetDirectory = 'docs/';

  let fileContents = shell.cat(`${sourceDirectory}test.cls`);
  let cModel = parseFileContents(fileContents);

  if (!cModel) {
    console.error('Class model could not be built.');
    return;
  }

  new FileManager(cModel).generate();
}

function parseFileContents(contents: shell.ShellString): ClassModel | null {
  let commentsStarted = false;
  let docBlockStarted = false;
  let nestedCurlyBraceDepth = 0;
  let lstComments = [];
  let cModel = null;
  let cModelParent = null;
  let cModels = [];

  let contentLines = contents.toString().split('\r\n');
  let iLine = 0;

  for (let i = 0; i < contentLines.length; i++) {
    let strLine = contentLines[i];
    iLine++;

    strLine = strLine.trim();
    if (strLine.length === 0) {
      continue;
    }

    // ignore anything after // style comments. this allows hiding of tokens from ApexDoc.
    let ich = strLine.indexOf('//');
    if (ich > -1) {
      strLine = strLine.substring(0, ich);
    }

    // gather up our comments
    if (strLine.startsWith('/*')) {
      commentsStarted = true;
      let commentEnded = false;
      if (strLine.startsWith('/**')) {
        if (strLine.endsWith('*/')) {
          strLine = strLine.replace('*/', '');
          commentEnded = true;
        }
        lstComments.push(strLine);
        docBlockStarted = true;
      }
      if (strLine.endsWith('*/') || commentEnded) {
        commentsStarted = false;
        docBlockStarted = false;
      }
      continue;
    }

    if (commentsStarted && strLine.endsWith('*/')) {
      strLine = strLine.replace('*/', '');
      if (docBlockStarted) {
        lstComments.push(strLine);
        docBlockStarted = false;
      }
      commentsStarted = false;
      continue;
    }

    if (commentsStarted) {
      if (docBlockStarted) {
        lstComments.push(strLine);
      }
      continue;
    }

    // keep track of our nesting so we know which class we are in
    let openCurlies = countChars(strLine, '{');
    let closeCurlies = countChars(strLine, '}');
    nestedCurlyBraceDepth += openCurlies;
    nestedCurlyBraceDepth -= closeCurlies;

    // if we are in a nested class, and we just got back to nesting level 1,
    // then we are done with the nested class, and should set its props and methods.
    if (nestedCurlyBraceDepth == 1 && openCurlies != closeCurlies && cModels.length > 1 && cModel != null) {
      cModels.pop();
      cModel = peek(cModels);
      continue;
    }

    // ignore anything after an =. this avoids confusing properties with methods.
    ich = strLine.indexOf('=');
    if (ich > -1) {
      strLine = strLine.substring(0, ich);
    }

    // ignore anything after an {. this avoids confusing properties with methods.
    ich = strLine.indexOf('{');
    if (ich > -1) {
      strLine = strLine.substring(0, ich);
    }

    //ignore lines not dealing with scope
    if (
      strContainsScope(strLine) === null &&
      // interface methods don't have scope
      !(cModel != null && cModel.getIsInterface() && strLine.includes('('))
    ) {
      continue;
    }

    // look for a class
    if (strLine.toLowerCase().includes(' class ') || strLine.toLowerCase().includes(' interface ')) {
      // create the new class
      let cModelNew: ClassModel = new ClassModel(cModelParent);
      fillClassModel(cModelNew, strLine, lstComments, iLine, cModelParent);
      lstComments.splice(0, lstComments.length); //clearing the array

      // keep track of the new class, as long as it wasn't a single liner {}
      // but handle not having any curlies on the class line!
      if (openCurlies == 0 || openCurlies != closeCurlies) {
        cModels.push(cModelNew);
        cModel = cModelNew;
      }

      // add it to its parent (or track the parent)
      if (cModelParent != null && cModelNew) cModelParent.addChildClass(cModelNew);
      else cModelParent = cModelNew;
      continue;
    }

    // look for a method
    if (strLine.includes('(')) {
      // deal with a method over multiple lines.
      while (!strLine.includes(')')) {
        i = i + 1;
        strLine = contentLines[i];
        iLine++;
      }
      let mModel = new MethodModel();
      fillMethodModel(mModel, strLine, lstComments, iLine);
      cModel.getMethods().push(mModel);
      lstComments.splice(0, lstComments.length); //clearing the array
      continue;
    }

    // handle set & get within the property
    if (
      strLine.includes(' get ') ||
      strLine.includes(' set ') ||
      strLine.includes(' get;') ||
      strLine.includes(' set;') ||
      strLine.includes(' get{') ||
      strLine.includes(' set{')
    )
      continue;

    // must be a property
    let propertyModel = new PropertyModel();
    fillPropertyModel(propertyModel, strLine, lstComments, iLine);
    cModel.getProperties().push(propertyModel);
    lstComments.splice(0, lstComments.length); //clearing the array
    continue;
  }

  return cModelParent;
}

function countChars(str: string, ch: string) {
  return str.split(ch).length - 1;
}

function strContainsScope(str: string) {
  str = str.toLowerCase();
  for (let i = 0; i < rgstrScope.length; i++) {
    if (str.toLowerCase().includes(rgstrScope[i].toLowerCase() + ' ')) {
      return rgstrScope[i];
    }
  }
  return null;
}

function fillClassModel(
  cModel: ClassModel,
  name: string,
  lstComments: Array<String>,
  iLine: number,
  cModelParent: ClassModel | null,
) {
  cModel.setNameLine(name, iLine);
  if (name.toLowerCase().includes(' interface ')) cModel.setIsInterface(true);
  let inDescription = false;
  let i = 0;
  for (let comment of lstComments) {
    i++;
    comment = comment.trim();

    let idxStart = comment.toLowerCase().indexOf('@author');
    if (idxStart != -1) {
      cModel.setAuthor(comment.substring(idxStart + 7).trim());
      inDescription = false;
      continue;
    }

    idxStart = comment.toLowerCase().indexOf('@date');
    if (idxStart != -1) {
      cModel.setDate(comment.substring(idxStart + 5).trim());
      inDescription = false;
      continue;
    }

    idxStart = comment.toLowerCase().indexOf('@group '); // needed to include space to not match group-content.
    if (idxStart != -1) {
      cModel.setClassGroup(comment.substring(idxStart + 6).trim());
      inDescription = false;
      continue;
    }

    idxStart = comment.toLowerCase().indexOf('@group-content');
    if (idxStart != -1) {
      cModel.setClassGroupContent(comment.substring(idxStart + 14).trim());
      inDescription = false;
      continue;
    }

    idxStart = comment.toLowerCase().indexOf('@description');
    if (idxStart != -1 || i == 1) {
      if (idxStart != -1 && comment.length > idxStart + 13)
        cModel.setDescription(comment.substring(idxStart + 12).trim());
      else {
        let found = comment.match('\\s');
        if (found && found.index) {
          cModel.setDescription(comment.substring(found.index).trim());
        }
      }
      inDescription = true;
      continue;
    }

    // handle multiple lines for description.
    if (inDescription) {
      let j;
      for (j = 0; j < comment.length; j++) {
        let ch = comment.charAt(j);
        if (ch != '*' && ch != ' ') break;
      }
      if (j < comment.length) {
        cModel.setDescription(cModel.getDescription() + ' ' + comment.substring(j));
      }
      continue;
    }
  }
}

function fillMethodModel(mModel: MethodModel, name: string, lstComments: Array<String>, iLine: number) {
  mModel.setNameLine(name, iLine);
  let inDescription = false;
  let inExample = false;
  let i = 0;
  for (let comment of lstComments) {
    i++;
    comment = comment.trim();

    let idxStart = comment.toLowerCase().indexOf('@author');
    if (idxStart != -1) {
      mModel.setAuthor(comment.substring(idxStart + 8).trim());
      inDescription = false;
      inExample = false;
      continue;
    }

    idxStart = comment.toLowerCase().indexOf('@date');
    if (idxStart != -1) {
      mModel.setDate(comment.substring(idxStart + 5).trim());
      inDescription = false;
      inExample = false;
      continue;
    }

    idxStart = comment.toLowerCase().indexOf('@return');
    if (idxStart != -1) {
      mModel.setReturns(comment.substring(idxStart + 7).trim());
      inDescription = false;
      inExample = false;
      continue;
    }

    idxStart = comment.toLowerCase().indexOf('@param');
    if (idxStart != -1) {
      mModel.getParams().push(comment.substring(idxStart + 6).trim());
      inDescription = false;
      inExample = false;
      continue;
    }

    idxStart = comment.toLowerCase().indexOf('@description');
    if (idxStart != -1 || i == 1) {
      if (idxStart != -1 && comment.length >= idxStart + 12)
        mModel.setDescription(comment.substring(idxStart + 12).trim());
      else {
        let found = comment.match('\\s');
        if (found && found.index) {
          mModel.setDescription(comment.substring(found.index).trim());
        }
      }
      inDescription = true;
      inExample = false;
      continue;
    }

    idxStart = comment.toLowerCase().indexOf('@example');
    if (idxStart != -1 || i == 1) {
      if (idxStart != -1 && comment.length >= idxStart + 8) {
        mModel.setExample(comment.substring(idxStart + 8).trim());
      } else {
        let found = comment.match('\\s');
        if (found && found.index) {
          mModel.setExample(comment.substring(found.index).trim());
        }
      }
      inDescription = false;
      inExample = true;
      continue;
    }

    // handle multiple lines for @description and @example.
    if (inDescription || inExample) {
      let j;
      for (j = 0; j < comment.length; j++) {
        let ch = comment.charAt(j);
        if (ch != '*' && ch != ' ') break;
      }
      if (j < comment.length) {
        if (inDescription) {
          mModel.setDescription(mModel.getDescription() + ' ' + comment.substring(j));
        } else if (inExample) {
          // Lets's not include the tag
          if (j == 0 && comment.substring(2, 10) == '* @example') {
            comment = comment.substring(10);
          }

          mModel.setExample(
            mModel.getExample() + (mModel.getExample().trim().length == 0 ? '' : '\n') + comment.substring(2),
          );
        }
      }
      continue;
    }
  }
}

function fillPropertyModel(propertyModel: PropertyModel, name: string, lstComments: Array<String>, iLine: number) {
  propertyModel.setNameLine(name, iLine);
  let inDescription = false;
  let i = 0;
  for (let comment of lstComments) {
    i++;
    comment = comment.trim();
    let idxStart = comment.toLowerCase().indexOf('@description');
    if (idxStart != -1 || i == 1) {
      if (idxStart != -1 && comment.length > idxStart + 13)
        propertyModel.setDescription(comment.substring(idxStart + 13).trim());
      else {
        let found = comment.match('\\s');
        if (found && found.index) {
          propertyModel.setDescription(comment.substring(found.index).trim());
        }
      }
      inDescription = true;
      continue;
    }

    // handle multiple lines for description.
    if (inDescription) {
      let j;
      for (j = 0; j < comment.length; j++) {
        let ch = comment.charAt(j);
        if (ch != '*' && ch != ' ') break;
      }
      if (j < comment.length) {
        propertyModel.setDescription(propertyModel.getDescription() + ' ' + comment.substring(j));
      }
      continue;
    }
  }
}

document();
