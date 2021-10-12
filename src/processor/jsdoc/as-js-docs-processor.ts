import * as fs from 'fs';
import * as path from 'path';
import { ClassMirror, Type } from '@cparra/apex-reflection';

import DocsProcessor from '../docs-processor';
import JsHelper from './helper/js-helper';
import { Logger } from '../../util/logger';

export default class AsJsDocsProcessor extends DocsProcessor {
  process(classModel: Type, outputDir: string) {
    const jsHelper = new JsHelper();
    this.generateDocsForClass(jsHelper, classModel);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const filePath = path.join(outputDir, `${classModel.name}.doc.js`);

    fs.writeFile(filePath, jsHelper.contents, 'utf8', () => {
      Logger.log(`${classModel.name} processed.`);
    });
  }

  generateDocsForClass(generator: JsHelper, typeModel: Type) {
    generator.initializeBlock();
    generator.declareType(typeModel.name, typeModel.docComment?.description ?? '');

    if (typeModel.type_name !== 'class') {
      return;
    }

    const classModel = typeModel as ClassMirror;

    this.addProperties(generator, classModel);
    generator.finalizeBlock();
    this.addInnerClasses(classModel, generator);
  }

  private addProperties(generator: JsHelper, classModel: ClassMirror) {
    if (classModel.properties.length === 0) {
      return;
    }

    classModel.properties
      .sort((propA, propB) => {
        if (propA.name < propB.name) return -1;
        if (propA.name > propB.name) return 1;
        return 0;
      })
      .forEach(propertyModel => {
        generator.declareProperty(propertyModel.type, propertyModel.name, propertyModel.docComment?.description ?? '');
      });
  }

  private addInnerClasses(classModel: ClassMirror, generator: JsHelper) {
    if (classModel.classes.length > 0) {
      classModel.classes
        .sort((classA, classB) => {
          if (classA.name < classB.name) return -1;
          if (classA.name > classB.name) return 1;
          return 0;
        })
        .forEach(innerClass => {
          this.generateDocsForClass(generator, innerClass);
        });
    }
  }
}
