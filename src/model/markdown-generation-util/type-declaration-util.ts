import { MarkdownFile } from '../markdown-file';
import { addCustomDocCommentAnnotations, addMermaid } from './doc-comment-annotation-util';
import { Annotation, ClassMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { TypesRepository } from '../types-repository';

export function declareType(markdownFile: MarkdownFile, typeMirror: Type): void {
  typeMirror.annotations.forEach((currentAnnotation: Annotation) => {
    markdownFile.addBlankLine();
    markdownFile.addText(`\`${currentAnnotation.type.toUpperCase()}\``);
  });

  if (typeMirror.docComment?.descriptionLines) {
    markdownFile.addBlankLine();
    for (const currentLine of typeMirror.docComment.descriptionLines) {
      markdownFile.addText(currentLine);
    }
    markdownFile.addBlankLine();
  }

  if (typeMirror.type_name === 'class') {
    addInheritanceSectionForClass(typeMirror, markdownFile);
  }

  if (typeMirror.type_name === 'interface') {
    addInheritanceSectionForInterface(typeMirror, markdownFile);
  }

  addCustomDocCommentAnnotations(markdownFile, typeMirror);

  addMermaid(markdownFile, typeMirror);
}

function addInheritanceSectionForClass(typeMirror: Type, markdownFile: MarkdownFile) {
  const typeAsClass = typeMirror as ClassMirror;
  if (typeAsClass.extended_class) {
    markdownFile.addBlankLine();
    markdownFile.addText('**Inheritance**');
    markdownFile.addBlankLine();
    addParent(markdownFile, typeAsClass);
    markdownFile.addText(typeMirror.name);
    markdownFile.addBlankLine();
  }

  if (typeAsClass.implemented_interfaces.length) {
    markdownFile.addBlankLine();
    markdownFile.addText('**Implemented types**');
    markdownFile.addBlankLine();
    for (let i = 0; i < typeAsClass.implemented_interfaces.length; i++) {
      const currentName = typeAsClass.implemented_interfaces[i];
      markdownFile.addLink(currentName);
      if (i < typeAsClass.implemented_interfaces.length - 1) {
        markdownFile.addText(', ');
      }
    }
    markdownFile.addBlankLine();
  }
}

function addInheritanceSectionForInterface(typeMirror: Type, markdownFile: MarkdownFile) {
  const typeAsInterface = typeMirror as InterfaceMirror;
  if (typeAsInterface.extended_interfaces.length) {
    markdownFile.addBlankLine();
    markdownFile.addText('**Extended types**');
    markdownFile.addBlankLine();
    for (let i = 0; i < typeAsInterface.extended_interfaces.length; i++) {
      const currentName = typeAsInterface.extended_interfaces[i];
      markdownFile.addLink(currentName);
      if (i < typeAsInterface.extended_interfaces.length - 1) {
        markdownFile.addText(', ');
      }
    }
  }
}

function addParent(markdownFile: MarkdownFile, classMirror: ClassMirror) {
  if (!classMirror.extended_class) {
    return;
  }

  const parentType = TypesRepository.getInstance().getFromScopedByName(classMirror.extended_class);
  if (!parentType) {
    return;
  }

  if (parentType.type_name === 'class') {
    addParent(markdownFile, parentType as ClassMirror);
  }

  markdownFile.addLink(parentType.name);
  markdownFile.addText(' > ');
}
