import * as fs from 'fs';

import FileGenerator from './FileGenerator';
import ClassModel from './ClassModel';

export default class FileManager {
  classModel: ClassModel;

  constructor(classModel: ClassModel) {
    this.classModel = classModel;
  }

  generate() {
    let generator = new FileGenerator();
    this.generateDocsForClass(generator, this.classModel, 1);

    if (!fs.existsSync('./docs')) {
      fs.mkdirSync('./docs');
    }

    fs.writeFile('./docs/doc.md', generator.contents, 'utf8', () => console.log('done'));
  }

  generateDocsForClass(generator: FileGenerator, classModel: ClassModel, level: number) {
    generator.addTitle(`${classModel.getClassName()} class`, level);

    if (classModel.getDescription()) {
      generator.addBlankLine();
      generator.addText(classModel.getDescription());
    }

    generator.addBlankLine();

    generator.addTitle('Properties', level + 1);
    generator.addBlankLine();
    classModel.getProperties().forEach(propertyModel => {
      generator.addTitle(propertyModel.getPropertyName(), 3);

      if (propertyModel.getDescription()) {
        generator.addBlankLine();
        generator.addText(propertyModel.getDescription());
      }

      generator.addBlankLine();
    });

    generator.addTitle('Methods', level + 1);

    classModel.getMethods().forEach(methodModel => {
      generator.addTitle(methodModel.getMethodName(), 3);

      if (methodModel.getDescription()) {
        generator.addBlankLine();
        generator.addText(methodModel.getDescription());
      }

      generator.addBlankLine();
    });

    console.log('inner', classModel.getChildClassesSorted().length);
    if (classModel.getChildClassesSorted().length > 0) {
      generator.addTitle('Inner Classes', level + 1);
      generator.addBlankLine();

      classModel.getChildClassesSorted().forEach(innerClass => {
        this.generateDocsForClass(generator, innerClass, level++);
      });
    }
  }
}
