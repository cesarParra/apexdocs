import { DocComment, DocCommentAnnotation } from '@cparra/apex-reflection';
import ClassFileGeneratorHelper from '../../transpiler/markdown/class-file-generatorHelper';
import { MarkdownFile } from '../markdown-file';

interface DocCommentAware {
  docComment?: DocComment;
}

export function addMermaid(markdownFile: MarkdownFile, docCommentAware: DocCommentAware) {
  const mermaid = docCommentAware.docComment?.annotations.find((annotation) => annotation.name === 'mermaid');
  if (!mermaid) {
    return;
  }

  markdownFile.addBlankLine();
  markdownFile.startCodeBlock('mermaid');
  mermaid.bodyLines.forEach((line) => {
    markdownFile.addText(line);
  });
  markdownFile.endCodeBlock();
  markdownFile.addBlankLine();
}

export function addCustomDocCommentAnnotations(markdownFile: MarkdownFile, docCommentAware: DocCommentAware) {
  docCommentAware.docComment?.annotations
    .filter((currentAnnotation: DocCommentAnnotation) => currentAnnotation.name !== 'description')
    .filter((currentAnnotation: DocCommentAnnotation) => currentAnnotation.name !== 'mermaid')
    .forEach((currentAnnotation: DocCommentAnnotation) => {
      markdownFile.addBlankLine();
      markdownFile.addText(buildDocAnnotationText(currentAnnotation));
      markdownFile.addBlankLine();
    });

  function splitAndCapitalize(text: string) {
    const words = text.split(/[-_]+/);
    const capitalizedWords = [];
    for (const word of words) {
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
