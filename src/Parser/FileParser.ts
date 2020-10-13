import ClassModel from '../model/ClassModel';

import Settings from '../Settings';

import ClassParser from './ClassParser';
import MethodParser from './MethodParser';
import PropertyParser from './PropertyParser';
import EnumParser from './EnumParser';

import { peek } from '../utils';

export default class FileParser {
  parseFileContents(rawFileContents: string): ClassModel | null {
    if (rawFileContents.length === 0) {
      return null;
    }

    let commentsStarted = false;
    let docBlockStarted = false;
    let namespaceAccessible: boolean | undefined = undefined;
    let nestedCurlyBraceDepth = 0;
    const lstComments = [];
    let cModel: ClassModel | null = null;
    let cModelParent;
    const cModels = [];

    const contentLines = this.splitAndClean(rawFileContents);
    // TODO: There is no difference between iLine and i, let's get rid of one
    let iLine = 0;

    for (let i = 0; i < contentLines.length; i++) {
      let strLine = contentLines[i];
      iLine++;

      strLine = strLine.trim();
      if (strLine.length === 0) {
        continue;
      }

      // If not within a code block, ignore anything after // style comments.
      let ich = strLine.indexOf('//');
      if (ich > -1 && !docBlockStarted) {
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
      const openCurlies = this.countChars(strLine, '{');
      const closeCurlies = this.countChars(strLine, '}');
      nestedCurlyBraceDepth += openCurlies;
      nestedCurlyBraceDepth -= closeCurlies;

      // if we are in a nested class, and we just got back to nesting level 1,
      // then we are done with the nested class, and should set its props and methods.
      if (nestedCurlyBraceDepth === 1 && openCurlies !== closeCurlies && cModels.length > 1 && cModel != null) {
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

      if (namespaceAccessible === undefined) {
        namespaceAccessible =
          strLine.toLowerCase().includes('@namespaceaccessible') && Settings.getInstance().includeNamespaceAccessible();
      }

      // Ignore lines not dealing with scope
      if (
        this.strContainsScope(strLine, namespaceAccessible) === null &&
        // interface methods don't have scope
        !(cModel != null && cModel.getIsInterface() && strLine.includes('('))
      ) {
        if (!namespaceAccessible) {
          // If not namespace accessible and not within the scope, then namespace accessibility scope should
          // be calculated again on the next pass.
          namespaceAccessible = undefined;
        }
        continue;
      }

      // look for a class
      if (strLine.toLowerCase().includes(' class ') || strLine.toLowerCase().includes(' interface ')) {
        // create the new class
        const cModelNew = new ClassParser().getClass(strLine, lstComments, iLine, cModelParent);
        cModelNew.setIsNamespaceAccessible(namespaceAccessible);
        // Resetting namespace accessible flag once it has been set.
        namespaceAccessible = undefined;
        lstComments.splice(0, lstComments.length);

        // keep track of the new class, as long as it wasn't a single liner {}
        // but handle not having any curlies on the class line!
        if (openCurlies === 0 || openCurlies !== closeCurlies) {
          cModels.push(cModelNew);
          cModel = cModelNew;
        }

        // add it to its parent (or track the parent)
        if (cModelParent != null && cModelNew) cModelParent.addChildClass(cModelNew);
        else cModelParent = cModelNew;
        continue;
      }

      // look for an enum
      if (strLine.toLowerCase().includes(' enum ')) {
        const enumModel = new EnumParser().getEnum(strLine, lstComments, iLine);
        enumModel.setIsNamespaceAccessible(namespaceAccessible);
        // Resetting namespace accessible flag once it has been set.
        namespaceAccessible = undefined;
        if (cModel) {
          cModel.addChildEnum(enumModel);
        } else {
          // If there is no class model defined that means this enum lives in a stand alone file.
          return enumModel;
        }

        lstComments.splice(0, lstComments.length);
        continue;
      }

      // look for a method
      if (strLine.includes('(')) {
        // deal with a method over multiple lines.
        while (!strLine.includes(')')) {
          i = i + 1;
          strLine += contentLines[i].trim();
          iLine++;
        }

        if (cModel) {
          // If we are dealing with an inner class, we want the contents to the right of the period
          const parsedClassName = cModel.getClassName().substr(cModel.getClassName().indexOf('.') + 1);
          const mModel = new MethodParser().getMethod(parsedClassName, strLine, lstComments, iLine);
          mModel.setIsNamespaceAccessible(namespaceAccessible);
          // Resetting namespace accessible flag once it has been set.
          namespaceAccessible = undefined;
          cModel.getMethods().push(mModel);
        }

        lstComments.splice(0, lstComments.length);
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
      if (cModel) {
        const propertyModel = new PropertyParser().getProperty(strLine, lstComments, iLine);
        propertyModel.setIsNamespaceAccessible(namespaceAccessible);
        // Resetting namespace accessible flag once it has been set.
        namespaceAccessible = undefined;
        cModel.getProperties().push(propertyModel);
      }

      lstComments.splice(0, lstComments.length);
      continue;
    }

    return cModelParent ? cModelParent : null;
  }

  splitAndClean(rawFileContents: string) {
    const contentLines = rawFileContents.split('\n');
    return contentLines.map(line => line.replace('\r', ''));
  }

  countChars(str: string, ch: string) {
    return str.split(ch).length - 1;
  }

  strContainsScope(str: string, isNamespaceAccessible: boolean) {
    str = str.toLowerCase();
    for (let i = 0; i < Settings.getInstance().getScope().length; i++) {
      if (
        str.toLowerCase().includes(
          Settings.getInstance()
            .getScope()
            [i].toLowerCase() + ' ',
        ) ||
        this.inNamespaceAccessibleScope(isNamespaceAccessible, str)
      ) {
        return Settings.getInstance().getScope()[i];
      }
    }
    return null;
  }

  private inNamespaceAccessibleScope(isNamespaceAccessible: boolean, str: string): boolean {
    return (
      isNamespaceAccessible &&
      Settings.getInstance().includeNamespaceAccessible() &&
      (str.toLowerCase().includes('global') ||
        str.toLowerCase().includes('public') ||
        str.toLowerCase().includes('protected'))
    );
  }
}
