import * as fs from 'fs';
import * as path from 'path';

import DocsProcessor from './DocsProcessor';
import MarkdownHelper from './MarkdownHelper';
import ClassModel from './model/ClassModel';
import Settings from './Settings';
import Configuration from './Configuration';
import MethodModel from './model/MethodModel';
import ClassFileGeneratorHelper from './ClassFileGeneratorHelper';

export default abstract class MarkdownDocsProcessor extends DocsProcessor {
  private classes: ClassModel[] = [];

  abstract getHomeFileName(): string;

  // tslint:disable-next-line:no-empty
  onBeforeHomeFileCreated(generator: MarkdownHelper) {
  }

  // tslint:disable-next-line:no-empty
  onBeforeClassFileCreated(generator: MarkdownHelper) {
  }

  onBeforeProcess(classes: ClassModel[], outputDir: string) {
    this.classes = classes;

    const headerContent = Configuration.getHeader();

    // Generate home page listing all classes.
    const generator = new MarkdownHelper(classes);

    this.onBeforeHomeFileCreated(generator);

    if (headerContent) {
      generator.addText(headerContent);
    }

    generator.addTitle('Classes');

    if (!Settings.getInstance().getShouldGroup()) {
      classes.forEach(classModel => {
        generator.addBlankLine();
        generator.addTitle(ClassFileGeneratorHelper.getFileLink(classModel), 2);
        generator.addBlankLine();
        generator.addBlankLine();
        generator.addText(classModel.getDescription());

        generator.addBlankLine();
        generator.addBlankLine();
      });
    } else {
      const groupedClasses: Map<string, ClassModel[]> = this.group(classes);

      groupedClasses.forEach((value: ClassModel[], key: string) => {
        generator.addTitle(key, 2);

        value.forEach(classModel => {
          generator.addBlankLine();
          generator.addTitle(ClassFileGeneratorHelper.getFileLink(classModel), 3);
          generator.addBlankLine();
          generator.addBlankLine();
          generator.addText(classModel.getDescription());

          generator.addBlankLine();
          generator.addBlankLine();
        });
      });
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const filePath = path.join(outputDir, this.getHomeFileName());
    fs.writeFile(filePath, generator.contents, 'utf8', () => {
      // tslint:disable-next-line:no-console
      console.log('Home page generated.');
    });
  }

  process(classModel: ClassModel, outputDir: string) {
    const generator = new MarkdownHelper(this.classes);
    this.onBeforeClassFileCreated(generator);
    const startingHeadingLevel = Configuration.getConfig()?.content?.startingHeadingLevel || 1;
    this.generateDocsForClass(generator, classModel, startingHeadingLevel);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    let filePath;
    if (!Settings.getInstance().getShouldGroup()) {
      filePath = path.join(outputDir, `${classModel.getClassName()}.md`);
    } else {
      const classGroupPath = path.join(outputDir, ClassFileGeneratorHelper.getSanitizedGroup(classModel));
      if (!fs.existsSync(classGroupPath)) {
        fs.mkdirSync(classGroupPath);
      }

      filePath = path.join(classGroupPath, `${classModel.getClassName()}.md`);
    }

    fs.writeFile(filePath, generator.contents, 'utf8', () => {
      // tslint:disable-next-line:no-console
      console.log(`${classModel.getClassName()} processed.`);
    });
  }

  generateDocsForClass(generator: MarkdownHelper, classModel: ClassModel, level: number) {
    Configuration.getConfig()?.content?.injections?.doc?.onInit?.forEach(injection => {
      generator.addText(injection);
    });
    const suffix = classModel.getIsInterface() ? 'interface' : classModel.getIsEnum() ? 'enum' : 'class';
    generator.addTitle(`${classModel.getClassName()} ${suffix}`, level);

    if (classModel.getIsNamespaceAccessible()) {
      generator.addBlankLine();
      generator.addText('`NamespaceAccessible`');
    }

    if (classModel.getDescription()) {
      generator.addBlankLine();
      generator.addText(classModel.getDescription());
      generator.addBlankLine();
    }

    if (Configuration.getConfig()?.content?.includeAuthor && classModel.getAuthor()) {
      generator.addBlankLine();
      generator.addText(`**Author:** ${classModel.getAuthor()}`);
    }

    if (Configuration.getConfig()?.content?.includeDate && classModel.getDate()) {
      generator.addBlankLine();
      generator.addText(`**Date:** ${classModel.getDate()}`);
    }

    if (classModel.getSeeList().length !== 0) {
      generator.addTitle('Related', level + 1);
      classModel.getSeeList().forEach(relatedClassName => {
        const relatedClass = this.classes.find(
          currentClassModel => currentClassModel.getClassName() === relatedClassName,
        );

        generator.addBlankLine();
        if (relatedClass) {
          generator.addText(ClassFileGeneratorHelper.getFileLink(relatedClass));
        } else {
          generator.addText(relatedClassName);
        }

        generator.addBlankLine();
      });
    }

    generator.addHorizontalRule();

    this.addConstructors(generator, level, classModel);
    this.addEnums(generator, level, classModel);
    this.addProperties(generator, level, classModel);
    this.addMethods(generator, level, classModel);
    this.addInnerClasses(classModel, generator, level);

    Configuration.getConfig()?.content?.injections?.doc?.onEnd?.forEach(injection => {
      generator.addText(injection);
    });
  }

  private group(classes: ClassModel[]): Map<string, ClassModel[]> {
    return classes.reduce((groups, currentClass) => {
      const key = currentClass.getClassGroup();
      const group: ClassModel[] = groups.get(key) || [];
      group.push(currentClass);
      groups.set(key, group);
      return groups;
    }, new Map());
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
        generator.addTitle(`\`${propertyModel.getPropertyName()}\` → \`${propertyModel.getReturnType()}\``, level + 2);

        if (classModel.getIsNamespaceAccessible()) {
          generator.addBlankLine();
          generator.addText('`NamespaceAccessible`');
        }

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
        Configuration.getConfig()?.content?.injections?.doc?.method?.onInit?.forEach(injection => {
          generator.addText(injection);
        });

        generator.addTitle(`\`${methodModel.getSignature()}\``, level + 2);

        if (classModel.getIsNamespaceAccessible()) {
          generator.addBlankLine();
          generator.addText('`NamespaceAccessible`');
        }

        if (methodModel.getDescription()) {
          generator.addBlankLine();
          generator.addText(methodModel.getDescription());
        }

        if (methodModel.getParams().length) {
          this.addParameters(generator, level, methodModel);
        }

        if (methodModel.getThrownExceptions().length) {
          this.addThrowsBlock(generator, level, methodModel);
        }

        if (methodModel.getExample() !== '') {
          Configuration.getConfig()?.content?.injections?.doc?.method?.onBeforeExample?.forEach(injection => {
            generator.addText(injection);
          });

          this.addExample(generator, methodModel, level);
        }

        Configuration.getConfig()?.content?.injections?.doc?.method?.onEnd?.forEach(injection => {
          generator.addText(injection);
        });
      });

    generator.addHorizontalRule();
  }

  private addEnums(generator: MarkdownHelper, level: number, classModel: ClassModel) {
    if (classModel.getChildEnums().length === 0) {
      return;
    }

    generator.addTitle('Enums', level + 1);
    classModel
      .getChildEnums()
      .sort((enumA, enumB) => {
        if (enumA.getClassName() < enumB.getClassName()) return -1;
        if (enumA.getClassName() > enumB.getClassName()) return 1;
        return 0;
      })
      .forEach(enumModel => {
        generator.addTitle(enumModel.getClassName(), level + 2);
        generator.addBlankLine();

        if (classModel.getIsNamespaceAccessible()) {
          generator.addBlankLine();
          generator.addText('`NamespaceAccessible`');
        }

        if (enumModel.getDescription()) {
          generator.addBlankLine();
          generator.addText(enumModel.getDescription());
          generator.addBlankLine();
        }
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
        Configuration.getConfig()?.content?.injections?.doc?.method?.onInit?.forEach(injection => {
          generator.addText(injection);
        });

        generator.addTitle(`\`${methodModel.getSignature()}\` → \`${methodModel.getReturnType()}\``, level + 2);

        if (classModel.getIsNamespaceAccessible()) {
          generator.addBlankLine();
          generator.addText('`NamespaceAccessible`');
        }

        if (methodModel.getDescription()) {
          generator.addBlankLine();
          generator.addText(methodModel.getDescription());
          generator.addBlankLine();
        }

        if (methodModel.getParams().length) {
          this.addParameters(generator, level, methodModel);
        }

        if (methodModel.getReturns().length) {
          this.addReturns(generator, level, methodModel);
        }

        if (methodModel.getThrownExceptions().length) {
          this.addThrowsBlock(generator, level, methodModel);
        }

        if (methodModel.getExample() !== '') {
          Configuration.getConfig()?.content?.injections?.doc?.method?.onBeforeExample?.forEach(injection => {
            generator.addText(injection);
          });
          this.addExample(generator, methodModel, level);
        }

        Configuration.getConfig()?.content?.injections?.doc?.method?.onEnd?.forEach(injection => {
          generator.addText(injection);
        });
      });

    generator.addHorizontalRule();
  }

  private addInnerClasses(classModel: ClassModel, generator: MarkdownHelper, level: number) {
    if (classModel.getChildClasses().length > 0) {
      generator.addTitle('Inner Classes', ++level);
      level++;
      generator.addBlankLine();
      classModel
        .getChildClasses()
        .sort((classA, classB) => {
          if (classA.getClassName() < classB.getClassName()) return -1;
          if (classA.getClassName() > classB.getClassName()) return 1;
          return 0;
        })
        .forEach(innerClass => {
          this.generateDocsForClass(generator, innerClass, level);
        });
    }
  }

  private addParameters(generator: MarkdownHelper, level: number, methodModel: MethodModel) {
    generator.addTitle('Parameters', level + 3);
    // Building a table to display the parameters
    generator.addText('|Param|Description|');
    generator.addText('|-----|-----------|');

    methodModel.getParams().forEach(param => {
      const paramName = param.substr(0, param.indexOf(' '));
      const paramDescription = param.substr(param.indexOf(' '));

      generator.addText(`|\`${paramName}\` | ${paramDescription} |`);
    });

    generator.addBlankLine();
  }

  private addReturns(generator: MarkdownHelper, level: number, methodModel: MethodModel) {
    generator.addTitle('Return', level + 3);
    generator.addBlankLine();
    generator.addText('**Type**');
    generator.addBlankLine();
    generator.addText(methodModel.getReturnType());
    generator.addBlankLine();
    generator.addText('**Description**');
    generator.addBlankLine();
    generator.addText(methodModel.getReturns());
    generator.addBlankLine();
  }

  private addThrowsBlock(generator: MarkdownHelper, level: number, methodModel: MethodModel) {
    generator.addTitle('Throws', level + 3);
    // Building a table to display the exceptions
    generator.addText('|Exception|Description|');
    generator.addText('|---------|-----------|');

    methodModel.getThrownExceptions().forEach(param => {
      const exceptionName = param.substr(0, param.indexOf(' '));
      const exceptionDescription = param.substr(param.indexOf(' '));

      generator.addText(`|\`${exceptionName}\` | ${exceptionDescription} |`);
    });

    generator.addBlankLine();
  }

  private addExample(generator: MarkdownHelper, methodModel: MethodModel, level: number) {
    generator.addTitle('Example', level + 3);
    generator.startCodeBlock();
    generator.addText(methodModel.getExample(), false);
    generator.endCodeBlock();
    generator.addBlankLine();
  }
}
