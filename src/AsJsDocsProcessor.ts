import * as fs from 'fs';
import * as path from 'path';

import DocsProcessor from './DocsProcessor';
import JsHelper from './JsHelper';
import ClassModel from './Model/ClassModel';

export default class AsJsDocsProcessor extends DocsProcessor {
  process(classModel: ClassModel, outputDir: string) {
    const jsHelper = new JsHelper();
    this.generateDocsForClass(jsHelper, classModel);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const filePath = path.join(outputDir, `${classModel.getClassName()}.doc.js`);

    fs.writeFile(filePath, jsHelper.contents, 'utf8', () => {
      // tslint:disable-next-line:no-console
      console.log(`${classModel.getClassName()} processed.`);
    });
  }

  generateDocsForClass(generator: JsHelper, classModel: ClassModel) {
    generator.initializeBlock();
    generator.declareType(classModel.getClassName(false), classModel.getDescription());
    this.addProperties(generator, classModel);
    generator.finalizeBlock();
    this.addInnerClasses(classModel, generator);
  }

  private addProperties(generator: JsHelper, classModel: ClassModel) {
    if (classModel.getProperties().length === 0) {
      return;
    }

    classModel
      .getProperties()
      .sort((propA, propB) => {
        if (propA.getPropertyName() < propB.getPropertyName()) return -1;
        if (propA.getPropertyName() > propB.getPropertyName()) return 1;
        return 0;
      })
      .forEach(propertyModel => {
        generator.declareProperty(
          propertyModel.getReturnType(),
          propertyModel.getPropertyName(),
          propertyModel.getDescription(),
        );
      });
  }

  private addInnerClasses(classModel: ClassModel, generator: JsHelper) {
    if (classModel.getChildClasses().length > 0) {
      classModel
        .getChildClasses()
        .sort((classA, classB) => {
          if (classA.getClassName() < classB.getClassName()) return -1;
          if (classA.getClassName() > classB.getClassName()) return 1;
          return 0;
        })
        .forEach(innerClass => {
          this.generateDocsForClass(generator, innerClass);
        });
    }
  }
}
