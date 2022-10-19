import { MarkdownFile } from '../markdown-file';
import { addCustomDocCommentAnnotations } from './doc-comment-annotation-util';
import { Annotation, ClassMirror, Type } from '@cparra/apex-reflection';
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
    const typeAsClass = typeMirror as ClassMirror;
    if (typeAsClass.extended_class) {
      markdownFile.addBlankLine();
      markdownFile.addText('Inheritance');
      markdownFile.addBlankLine();
      addParent(markdownFile, typeAsClass);
      markdownFile.addText(typeMirror.name);
      markdownFile.addBlankLine();
    }
  }

  addCustomDocCommentAnnotations(markdownFile, typeMirror);
}

function addParent(markdownFile: MarkdownFile, classMirror: ClassMirror) {
  if (!classMirror.extended_class) {
    return;
  }

  const parentType = TypesRepository.getInstance().getByName(classMirror.extended_class);
  if (!parentType) {
    return;
  }

  if (parentType.type_name === 'class') {
    addParent(markdownFile, parentType as ClassMirror);
  }

  markdownFile.addLink(parentType.name);
  markdownFile.addText(' > ');
}
