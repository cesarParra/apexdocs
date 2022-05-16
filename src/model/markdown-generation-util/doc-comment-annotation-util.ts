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

  function splitAndCapitalize(text: string) {
    const words = text.split(/[-_]+/);
    const capitalizedWords = [];
    for (const word of words) {
      console.log(`current word ${word}`);
      capitalizedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
    return capitalizedWords.join(' ');
  }

  function buildDocAnnotationText(annotation: DocCommentAnnotation) {
    let annotationBodyText = annotation.body;
    if (annotation.name.toLowerCase() === 'see') {
      annotationBodyText = ClassFileGeneratorHelper.getFileLinkByTypeName(annotation.body);
    }
    return `**${splitAndCapitalize(annotation.name)}** ${annotationBodyText}`;
  }
}
