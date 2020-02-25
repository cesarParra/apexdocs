import * as fs from 'fs';
import * as path from 'path';

import Settings from './Settings';
import MarkdownHelper from './MarkdownHelper';
import ClassModel from './model/ClassModel';

export default class FileManager {
  classModels: ClassModel[];

  constructor(classModels: ClassModel[]) {
    this.classModels = classModels;
  }

  // TODO: Make static
  generate() {
    this.classModels.forEach(classModel => {
      let generator = new MarkdownHelper();
      this.generateDocsForClass(generator, classModel, 1);

      let outputPath = Settings.getInstance().getOutputDir();

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
      }

      let filePath = path.join(outputPath, `${classModel.getClassName()}.md`);
      fs.writeFile(filePath, generator.contents, 'utf8', () => {});
    });
  }

  generateDocsForClass(generator: MarkdownHelper, classModel: ClassModel, level: number) {
    let suffix = classModel.getIsInterface() ? 'interface' : 'class';
    generator.addTitle(`${classModel.getClassName()} ${suffix}`, level);

    if (classModel.getDescription()) {
      generator.addBlankLine();
      generator.addText(classModel.getDescription());
      generator.addBlankLine();
    }

    generator.addHorizontalRule();

    this.addConstructors(generator, level, classModel);
    this.addProperties(generator, level, classModel);
    this.addMethods(generator, level, classModel);
    this.addInnerClasses(classModel, generator, level);
  }

  private addProperties(generator: MarkdownHelper, level: number, classModel: ClassModel) {
    if (classModel.getProperties().length === 0) {
      return;
    }

    generator.addTitle('Properties', level + 1);
    generator.addBlankLine();
    classModel
      .getProperties()
      .sort((propA, propB) => {
        if (propA.getPropertyName() < propB.getPropertyName()) return -1;
        if (propA.getPropertyName() > propB.getPropertyName()) return 1;
        return 0;
      })
      .forEach(propertyModel => {
        generator.addTitle(propertyModel.getPropertyName(), 3);
        if (propertyModel.getDescription()) {
          generator.addBlankLine();
          generator.addText(propertyModel.getDescription());
        }
        generator.addBlankLine();
      });

    generator.addHorizontalRule();
  }

  private addConstructors(generator: MarkdownHelper, level: number, classModel: ClassModel) {
    if (classModel.getMethods().filter(method => method.getIsConstructor()).length === 0) {
      return;
    }

    generator.addTitle('Constructors', level + 1);
    classModel
      .getMethods()
      .filter(method => method.getIsConstructor())
      .forEach(methodModel => {
        //generator.addTitle(methodModel.getMethodName(), level + 2);
        generator.addTitle(`\`${methodModel.getSignature()}\``, level + 2);
        if (methodModel.getDescription()) {
          generator.addBlankLine();
          generator.addText(methodModel.getDescription());
        }
        generator.addBlankLine();
      });

    generator.addHorizontalRule();
  }

  private addMethods(generator: MarkdownHelper, level: number, classModel: ClassModel) {
    if (classModel.getMethods().filter(method => !method.getIsConstructor()).length === 0) {
      return;
    }

    generator.addTitle('Methods', level + 1);
    classModel
      .getMethods()
      .sort((methodA, methodB) => {
        if (methodA.getMethodName() < methodB.getMethodName()) return -1;
        if (methodA.getMethodName() > methodB.getMethodName()) return 1;
        return 0;
      })
      .filter(method => !method.getIsConstructor())
      .forEach(methodModel => {
        //generator.addTitle(methodModel.getMethodName(), level + 2);
        generator.addTitle(`\`${methodModel.getSignature()}\` → \`${methodModel.getReturnType()}\``, level + 2);
        if (methodModel.getDescription()) {
          generator.addBlankLine();
          generator.addText(methodModel.getDescription());
        }
        generator.addBlankLine();
      });

    generator.addHorizontalRule();
  }

  private addInnerClasses(classModel: ClassModel, generator: MarkdownHelper, level: number) {
    if (classModel.getChildClasses().length > 0) {
      generator.addTitle('Inner Classes', level + 1);
      generator.addBlankLine();
      classModel
        .getChildClasses()
        .sort((classA, classB) => {
          if (classA.getClassName() < classB.getClassName()) return -1;
          if (classA.getClassName() > classB.getClassName()) return 1;
          return 0;
        })
        .forEach(innerClass => {
          this.generateDocsForClass(generator, innerClass, level++);
        });
    }
  }
}
