import { MarkdownFile } from '../markdown-file';
import { Type } from '@cparra/apex-reflection';

export function declareType(markdownFile: MarkdownFile, typeMirror: Type, startingHeadingLevel: number): void {
  markdownFile.addTitle(typeMirror.name, startingHeadingLevel);

  typeMirror.annotations.forEach((currentAnnotation) => {
    markdownFile.addBlankLine();
    markdownFile.addText(`\`${currentAnnotation.type.toUpperCase()}\``);
  });

  if (typeMirror.docComment?.description) {
    markdownFile.addBlankLine();
    markdownFile.addText(typeMirror.docComment.description);
    markdownFile.addBlankLine();
  }

  function capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  typeMirror.docComment?.annotations
    .filter((currentAnnotation) => currentAnnotation.name !== 'description')
    .forEach((currentAnnotation) => {
      markdownFile.addBlankLine();
      markdownFile.addText(`**${capitalizeFirstLetter(currentAnnotation.name)}** ${currentAnnotation.body}`);
      markdownFile.addBlankLine();
    });
}
