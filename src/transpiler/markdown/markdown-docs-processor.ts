import * as fs from 'fs';
import * as path from 'path';
import {
  ClassMirror,
  ConstructorMirror,
  DocComment,
  InterfaceMirror,
  MethodMirror,
  Type,
} from '@cparra/apex-reflection';

import ProcessorTypeTranspiler from './processor-type-transpiler';
import MarkdownHelper from './markdown-helper';
import Configuration from './../Configuration';
import ClassFileGeneratorHelper from './class-file-generatorHelper';
import { Annotation, ParameterMirror } from '@cparra/apex-reflection/index';
import { Logger } from '../util/logger';
import { Settings } from '../Settings';

type AnnotationsAware = {
  annotations: Annotation[];
};

type DocCommentAware = {
  docComment?: DocComment;
};

type ParameterAware = {
  parameters: ParameterMirror[];
};

function buildSignature(name: string, parameterAware: ParameterAware): string {
  let signature = `${name}(`;
  const signatureParameters = parameterAware.parameters.map(param => {
    signature += `${param.type} ${param.name}`;
  });
  signature += signatureParameters.join(', ');
  return (signature += ')');
}

export default abstract class MarkdownDocsProcessor extends ProcessorTypeTranspiler {
  private classes: Type[] = [];

  abstract getHomeFileName(): string;

  // tslint:disable-next-line:no-empty
  onBeforeHomeFileCreated(generator: MarkdownHelper) {
  }

  // tslint:disable-next-line:no-empty
  onBeforeClassFileCreated(generator: MarkdownHelper) {
  }

  onBeforeProcess(classes: Type[], outputDir: string) {
    this.classes = classes;

    const headerContent = Configuration.getHeader();

    // Generate home page listing all classes.
    const generator = new MarkdownHelper(classes);

    this.onBeforeHomeFileCreated(generator);

    if (headerContent) {
      generator.addText(headerContent);
    }

    generator.addTitle('Classes');

    if (!Settings.getInstance().shouldGroup) {
      classes.forEach(classModel => {
        generator.addBlankLine();
        generator.addTitle(ClassFileGeneratorHelper.getFileLink(classModel), 2);
        generator.addBlankLine();
        generator.addBlankLine();
        generator.addText(classModel.docComment?.description ?? '');

        generator.addBlankLine();
        generator.addBlankLine();
      });
    } else {
      const groupedClasses: Map<string, Type[]> = this.group(classes);

      groupedClasses.forEach((value: Type[], key: string) => {
        generator.addTitle(key, 2);

        value.forEach(classModel => {
          generator.addBlankLine();
          generator.addTitle(ClassFileGeneratorHelper.getFileLink(classModel), 3);
          generator.addBlankLine();
          generator.addBlankLine();
          generator.addText(classModel.docComment?.description ?? '');

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
      Logger.log('Home page generated.');
    });
  }

  process(classModel: Type, outputDir: string) {
    const generator = new MarkdownHelper(this.classes);
    this.onBeforeClassFileCreated(generator);
    const startingHeadingLevel = Configuration.getConfig()?.content?.startingHeadingLevel || 1;
    this.generateDocsForClass(generator, classModel, startingHeadingLevel);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    let filePath;
    if (!Settings.getInstance().shouldGroup) {
      filePath = path.join(outputDir, `${classModel.name}.md`);
    } else {
      const classGroupPath = path.join(outputDir, ClassFileGeneratorHelper.getSanitizedGroup(classModel));
      if (!fs.existsSync(classGroupPath)) {
        fs.mkdirSync(classGroupPath);
      }

      filePath = path.join(classGroupPath, `${classModel.name}.md`);
    }

    fs.writeFile(filePath, generator.contents, 'utf8', () => {
      Logger.log(`${classModel.name} processed.`);
    });
  }

  generateDocsForClass(generator: MarkdownHelper, classModel: Type, level: number) {
    const isNamespaceAccessible = this.isNamespaceAccessible(classModel);
    if (isNamespaceAccessible) {
      generator.addBlankLine();
      generator.addText('`NamespaceAccessible`');
    }

    if (classModel.docComment?.description) {
      generator.addBlankLine();
      generator.addText(classModel.docComment.description);
      generator.addBlankLine();
    }

    const author = classModel.docComment?.annotations.find(annotation => annotation.name === 'author');
    if (Configuration.getConfig()?.content?.includeAuthor && !!author) {
      generator.addBlankLine();
      generator.addText(`**Author:** ${author.body}`);
    }
    const date = classModel.docComment?.annotations.find(annotation => annotation.name === 'date');
    if (Configuration.getConfig()?.content?.includeDate && !!date) {
      generator.addBlankLine();
      generator.addText(`**Date:** ${date.body}`);
    }

    const seeList = classModel.docComment?.annotations.filter(annotation => annotation.name === 'see') ?? [];
    if (seeList.length !== 0) {
      generator.addTitle('Related', level + 1);
      seeList.forEach(seeAnnotation => {
        const relatedClass = this.classes.find(currentClassModel => currentClassModel.name === seeAnnotation.body);

        generator.addBlankLine();
        if (relatedClass) {
          generator.addText(ClassFileGeneratorHelper.getFileLink(relatedClass));
        } else {
          generator.addText(seeAnnotation.body);
        }

        generator.addBlankLine();
      });
    }

    generator.addHorizontalRule();

    if (classModel.type_name === 'enum') {
      return;
    }
    if (classModel.type_name === 'interface') {
      this.addMethods(generator, level, classModel as InterfaceMirror);
      return;
    }

    // TODO: We also now want to add fields
    this.addConstructors(generator, level, classModel as ClassMirror);
    this.addEnums(generator, level, classModel as ClassMirror);
    this.addProperties(generator, level, classModel as ClassMirror);
    this.addMethods(generator, level, classModel as ClassMirror);
    this.addInnerClasses(classModel as ClassMirror, generator, level);

    Configuration.getConfig()?.content?.injections?.doc?.onEnd?.forEach(injection => {
      generator.addText(injection);
    });
  }

  private isNamespaceAccessible(annotationsAware: AnnotationsAware): boolean {
    return !!annotationsAware.annotations.find(annotation => annotation.name === 'namespaceaccessible');
  }

  // TODO: This code is repeated here and in ClassFileGeneratorHelper
  private getClassGroup(classModel: Type): string {
    const groupAnnotation = classModel.docComment?.annotations.find(annotation => annotation.name === 'group');
    return groupAnnotation?.body ?? '';
  }

  private group(classes: Type[]): Map<string, Type[]> {
    return classes.reduce((groups, currentClass) => {
      const key = this.getClassGroup(currentClass);
      const group: Type[] = groups.get(key) || [];
      group.push(currentClass);
      groups.set(key, group);
      return groups;
    }, new Map());
  }

  private addProperties(generator: MarkdownHelper, level: number, classModel: ClassMirror) {
    if (classModel.properties.length === 0) {
      return;
    }

    generator.addTitle('Properties', level + 1);
    generator.addBlankLine();
    classModel.properties
      .sort((propA, propB) => {
        if (propA.name < propB.name) return -1;
        if (propA.name > propB.name) return 1;
        return 0;
      })
      .forEach(propertyModel => {
        generator.addTitle(`\`${propertyModel.name}\` → \`${propertyModel.type}\``, level + 2);

        if (this.isNamespaceAccessible(classModel)) {
          generator.addBlankLine();
          generator.addText('`NamespaceAccessible`');
        }

        if (propertyModel.docComment?.description) {
          generator.addBlankLine();
          generator.addText(propertyModel.docComment.description);
        }
        generator.addBlankLine();
      });

    generator.addHorizontalRule();
  }

  private addConstructors(generator: MarkdownHelper, level: number, classModel: ClassMirror) {
    if (classModel.constructors.length === 0) {
      return;
    }

    generator.addTitle('Constructors', level + 1);
    classModel.constructors.forEach(currentConstructor => {
      Configuration.getConfig()?.content?.injections?.doc?.method?.onInit?.forEach(injection => {
        generator.addText(injection);
      });

      generator.addTitle(`\`${buildSignature(classModel.name, currentConstructor)}\``, level + 2);

      if (this.isNamespaceAccessible(currentConstructor)) {
        generator.addBlankLine();
        generator.addText('`NamespaceAccessible`');
      }

      if (currentConstructor.docComment?.description) {
        generator.addBlankLine();
        generator.addText(currentConstructor.docComment.description);
      }

      if (currentConstructor.parameters.length) {
        this.addParameters(generator, level, currentConstructor);
      }

      this.addThrowsBlock(generator, level, currentConstructor);

      if (currentConstructor.docComment?.exampleAnnotation) {
        Configuration.getConfig()?.content?.injections?.doc?.method?.onBeforeExample?.forEach(injection => {
          generator.addText(injection);
        });

        this.addExample(generator, currentConstructor, level);
      }

      Configuration.getConfig()?.content?.injections?.doc?.method?.onEnd?.forEach(injection => {
        generator.addText(injection);
      });
    });

    generator.addHorizontalRule();
  }

  private addEnums(generator: MarkdownHelper, level: number, classModel: ClassMirror) {
    if (classModel.enums.length === 0) {
      return;
    }

    generator.addTitle('Enums', level + 1);
    classModel.enums
      .sort((enumA, enumB) => {
        if (enumA.name < enumB.name) return -1;
        if (enumA.name > enumB.name) return 1;
        return 0;
      })
      .forEach(enumModel => {
        generator.addTitle(enumModel.name, level + 2);
        generator.addBlankLine();

        if (this.isNamespaceAccessible(enumModel)) {
          generator.addBlankLine();
          generator.addText('`NamespaceAccessible`');
          generator.addBlankLine();
        }

        if (enumModel.docComment?.description) {
          generator.addBlankLine();
          generator.addText(enumModel.docComment.description);
          generator.addBlankLine();
        }
      });

    generator.addHorizontalRule();
  }

  private addMethods(generator: MarkdownHelper, level: number, classModel: ClassMirror | InterfaceMirror) {
    if (classModel.methods.length === 0) {
      return;
    }

    generator.addTitle('Methods', level + 1);
    classModel.methods
      .sort((methodA, methodB) => {
        if (methodA.name < methodB.name) return -1;
        if (methodA.name > methodB.name) return 1;
        return 0;
      })
      .forEach(methodModel => {
        Configuration.getConfig()?.content?.injections?.doc?.method?.onInit?.forEach(injection => {
          generator.addText(injection);
        });

        generator.addTitle(`\`${buildSignature(methodModel.name, methodModel)}\` → \`${methodModel.type}\``, level + 2);

        if (this.isNamespaceAccessible(methodModel)) {
          generator.addBlankLine();
          generator.addText('`NamespaceAccessible`');
        }

        if (methodModel.docComment?.description) {
          generator.addBlankLine();
          generator.addText(methodModel.docComment.description);
          generator.addBlankLine();
        }

        if (methodModel.parameters.length) {
          this.addParameters(generator, level, methodModel);
        }

        this.addReturns(generator, level, methodModel);
        // TODO: Long duplicate fragment detected
        this.addThrowsBlock(generator, level, methodModel);

        if (methodModel.docComment?.exampleAnnotation) {
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

  private addInnerClasses(classModel: ClassMirror, generator: MarkdownHelper, level: number) {
    if (classModel.classes.length > 0) {
      // TODO: We should try to avoid hardcoding the titles like this, and make that configurable to allow for I18N
      generator.addTitle('Inner Classes', ++level);
      level++;
      generator.addBlankLine();
      classModel.classes
        .sort((classA, classB) => {
          if (classA.name < classB.name) return -1;
          if (classA.name > classB.name) return 1;
          return 0;
        })
        .forEach(innerClass => {
          this.generateDocsForClass(generator, innerClass, level);
        });
    }
  }

  private addParameters(generator: MarkdownHelper, level: number, methodModel: MethodMirror | ConstructorMirror) {
    generator.addTitle('Parameters', level + 3);
    // Building a table to display the parameters
    generator.addText('|Param|Description|');
    generator.addText('|-----|-----------|');

    methodModel.docComment?.paramAnnotations.forEach(paramAnnotation => {
      const paramName = paramAnnotation.paramName;
      const paramDescription = paramAnnotation.bodyLines.join(' ');
      generator.addText(`|\`${paramName}\` | ${paramDescription} |`);
    });

    generator.addBlankLine();
  }

  private addReturns(generator: MarkdownHelper, level: number, methodModel: MethodMirror) {
    if (!methodModel.docComment?.returnAnnotation) {
      return;
    }

    generator.addTitle('Return', level + 3);
    generator.addBlankLine();
    generator.addText('**Type**');
    generator.addBlankLine();
    generator.addText(methodModel.type);
    generator.addBlankLine();
    generator.addText('**Description**');
    generator.addBlankLine();
    generator.addText(methodModel.docComment?.returnAnnotation.bodyLines.join(' '));
    generator.addBlankLine();
  }

  private addThrowsBlock(generator: MarkdownHelper, level: number, docCommentAware: DocCommentAware) {
    if (!docCommentAware.docComment?.throwsAnnotations) {
      return;
    }
    generator.addTitle('Throws', level + 3);
    // Building a table to display the exceptions
    generator.addText('|Exception|Description|');
    generator.addText('|---------|-----------|');

    docCommentAware.docComment?.throwsAnnotations.forEach(annotation => {
      const exceptionName = annotation.exceptionName;
      const exceptionDescription = annotation.bodyLines.join(' ');

      generator.addText(`|\`${exceptionName}\` | ${exceptionDescription} |`);
    });

    generator.addBlankLine();
  }

  private addExample(generator: MarkdownHelper, docCommentAware: DocCommentAware, level: number) {
    generator.addTitle('Example', level + 3);
    generator.startCodeBlock();
    docCommentAware.docComment?.exampleAnnotation.bodyLines.forEach(line => {
      generator.addText(line, false);
    });
    generator.endCodeBlock();
    generator.addBlankLine();
  }
}
