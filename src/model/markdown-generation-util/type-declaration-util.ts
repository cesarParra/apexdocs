import { MarkdownFile } from '../markdown-file';
import { addCustomDocCommentAnnotations } from './doc-comment-annotation-util';
import { Annotation, Type } from '@cparra/apex-reflection';

export function declareType(markdownFile: MarkdownFile, typeMirror: Type): void {
  typeMirror.annotations.forEach((currentAnnotation: Annotation) => {
    markdownFile.addBlankLine();
    markdownFile.addText(`\`${currentAnnotation.type.toUpperCase()}\``);
  });

  if (typeMirror.docComment?.description) {
    markdownFile.addBlankLine();
    markdownFile.addText(typeMirror.docComment.description);
    markdownFile.addBlankLine();
  }

  addCustomDocCommentAnnotations(markdownFile, typeMirror);
}
