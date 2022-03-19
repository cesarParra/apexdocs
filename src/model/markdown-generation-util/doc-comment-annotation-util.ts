import { DocComment, DocCommentAnnotation } from '@cparra/apex-reflection';
import ClassFileGeneratorHelper from '../../transpiler/markdown/class-file-generatorHelper';
import { MarkdownFile } from '../markdown-file';

interface DocCommentAware {
  docComment?: DocComment;
}

export function addCustomDocCommentAnnotations(markdownFile: MarkdownFile, docCommentAware: DocCommentAware) {
  docCommentAware.docComment?.annotations
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
