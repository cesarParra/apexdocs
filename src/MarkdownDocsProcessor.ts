import * as fs from 'fs';
import * as path from 'path';
import {
  ClassMirror,
  ConstructorMirror, DocComment,
  InterfaceMirror,
  MethodMirror,
  Type,
} from '@cparra/apex-reflection';

import DocsProcessor from './DocsProcessor';
import MarkdownHelper from './MarkdownHelper';
import Settings from './Settings';
import Configuration from './Configuration';
import ClassFileGeneratorHelper from './ClassFileGeneratorHelper';
import { Annotation } from '@cparra/apex-reflection/index';

type AnnotationsAware = {
  annotations: Annotation[]
}

type DocCommentAware = {
  docComment?: DocComment;
}

export default abstract class MarkdownDocsProcessor extends DocsProcessor {
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

    if (!Settings.getInstance().getShouldGroup()) {
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
      // tslint:disable-next-line:no-console
      console.log('Home page generated.');
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
    if (!Settings.getInstance().getShouldGroup()) {
      filePath = path.join(outputDir, `${classModel.name}.md`);
    } else {
      const classGroupPath = path.join(outputDir, ClassFileGeneratorHelper.getSanitizedGroup(classModel));
      if (!fs.existsSync(classGroupPath)) {
        fs.mkdirSync(classGroupPath);
      }

      filePath = path.join(classGroupPath, `${classModel.name}.md`);
    }

    fs.writeFile(filePath, generator.contents, 'utf8', () => {
      // tslint:disable-next-line:no-console
      console.log(`${classModel.name} processed.`);
    });
  }

  generateDocsForClass(generator: MarkdownHelper, classModel: Type, level: number) {
    Configuration.getConfig()?.content?.injections?.doc?.onInit?.forEach(injection => {
      generator.addText(injection);
    });
    const suffix = classModel.type_name;
    generator.addTitle(`${classModel.name} ${suffix}`, level);

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

      function constructorSignature(constructorMirror: ConstructorMirror): string {
        let signature = `${classModel.name}(`;
        const signatureParameters = constructorMirror.parameters.map(param => {
          signature += `${param.type} ${param.name}`;
        });
        signature += signatureParameters.join(', ');
        return signature += ')';
      }

      generator.addTitle(`\`${constructorSignature(currentConstructor)}\``, level + 2);

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

        // TODO: We need to find a replacement for this
        // generator.addTitle(`\`${methodModel.getSignature()}\` → \`${methodModel.getReturnType()}\``, level + 2);

        // TODO: We want to check if the method itself is NSAccessible
        // if (classModel.getIsNamespaceAccessible()) {
        //   generator.addBlankLine();
        //   generator.addText('`NamespaceAccessible`');
        // }

        if (methodModel.docComment?.description) {
          generator.addBlankLine();
          generator.addText(methodModel.docComment.description);
          generator.addBlankLine();
        }

        if (methodModel.parameters.length) {
          this.addParameters(generator, level, methodModel);
        }

        // TODO
        // if (methodModel.getReturns().length) {
        //   this.addReturns(generator, level, methodModel);
        // }
        //
        // TODO
        // if (methodModel.getThrownExceptions().length) {
        //   this.addThrowsBlock(generator, level, methodModel);
        // }
        //
        // TODO
        // if (methodModel.getExample() !== '') {
        //   Configuration.getConfig()?.content?.injections?.doc?.method?.onBeforeExample?.forEach(injection => {
        //     generator.addText(injection);
        //   });
        //   this.addExample(generator, methodModel, level);
        // }

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

    methodModel.parameters.forEach(param => {
      const paramName = param.name;
      // TODO: This comes from the parent method so we'll need to parse it or return it from the reflection
      const paramDescription = 'TODO';
      // const paramDescription = param.substr(param.indexOf(' '));

      generator.addText(`|\`${paramName}\` | ${paramDescription} |`);
    });

    generator.addBlankLine();
  }

  // TODO
  // private addReturns(generator: MarkdownHelper, level: number, methodModel: MethodMirror) {
  //   generator.addTitle('Return', level + 3);
  //   generator.addBlankLine();
  //   generator.addText('**Type**');
  //   generator.addBlankLine();
  //   generator.addText(methodModel.getReturnType());
  //   generator.addBlankLine();
  //   generator.addText('**Description**');
  //   generator.addBlankLine();
  //   generator.addText(methodModel.getReturns());
  //   generator.addBlankLine();
  // }

  private addThrowsBlock(generator: MarkdownHelper, level: number, docCommentAware: DocCommentAware) {
    generator.addTitle('Throws', level + 3);
    // Building a table to display the exceptions
    generator.addText('|Exception|Description|');
    generator.addText('|---------|-----------|');

    docCommentAware.docComment?.throwsAnnotations
      .forEach(annotation => {
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
