import * as fs from 'fs';
import * as path from 'path';

import Settings from './Settings';
import MarkdownHelper from './MarkdownHelper';
import ClassModel from './Model/ClassModel';

export default class FileManager {
  classModels: ClassModel[];

  constructor(classModels: ClassModel[]) {
    this.classModels = classModels;
  }

  generate() {
    this.classModels.forEach(classModel => {
      let generator = new MarkdownHelper();
      this.generateDocsForClass(generator, classModel, 1);

      let outputPath = Settings.getInstance().getOutputDir();

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
      }

      let filePath = path.join(outputPath, `${classModel.getClassName()}.md`);
      fs.writeFile(filePath, generator.contents, 'utf8', () => console.log('Generated file', filePath));
    });
  }

  generateDocsForClass(generator: MarkdownHelper, classModel: ClassModel, level: number) {
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

    if (classModel.getChildClassesSorted().length > 0) {
      generator.addTitle('Inner Classes', level + 1);
      generator.addBlankLine();

      classModel.getChildClassesSorted().forEach(innerClass => {
        this.generateDocsForClass(generator, innerClass, level++);
      });
    }
  }
}
