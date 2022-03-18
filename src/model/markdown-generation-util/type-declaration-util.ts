import { MarkdownFile } from '../markdown-file';
import { Annotation, Type, DocCommentAnnotation } from '@cparra/apex-reflection';
import ClassFileGeneratorHelper from '../../transpiler/markdown/class-file-generatorHelper';

export function declareType(markdownFile: MarkdownFile, typeMirror: Type, startingHeadingLevel: number): void {
  markdownFile.addTitle(typeMirror.name, startingHeadingLevel);

  typeMirror.annotations.forEach((currentAnnotation: Annotation) => {
    markdownFile.addBlankLine();
    markdownFile.addText(`\`${currentAnnotation.type.toUpperCase()}\``);
  });

  if (typeMirror.docComment?.description) {
    markdownFile.addBlankLine();
    markdownFile.addText(typeMirror.docComment.description);
    markdownFile.addBlankLine();
  }

  typeMirror.docComment?.annotations
    .filter((currentAnnotation: DocCommentAnnotation) => currentAnnotation.name !== 'description')
    .forEach((currentAnnotation: DocCommentAnnotation) => {
      markdownFile.addBlankLine();
      markdownFile.addText(buildDocAnnotationText(currentAnnotation));
      markdownFile.addBlankLine();
    });

  function capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function buildDocAnnotationText(annotation: DocCommentAnnotation) {
    let annotationBodyText = annotation.body;
    if (annotation.name.toLowerCase() === 'see') {
      annotationBodyText = ClassFileGeneratorHelper.getFileLinkByTypeName(annotation.body);
    }
    return `**${capitalizeFirstLetter(annotation.name)}** ${annotationBodyText}`;
  }
}
