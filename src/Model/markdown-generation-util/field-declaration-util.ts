import { MarkdownFile } from '../markdown-file';
import { FieldMirror, PropertyMirror } from '@cparra/apex-reflection';

export function declareField(markdownFile: MarkdownFile, fields: FieldMirror[] | PropertyMirror[], startingHeadingLevel: number) {
  markdownFile.addTitle('Fields', startingHeadingLevel + 1);
  markdownFile.addBlankLine();
  fields
    .sort((propA, propB) => {
      if (propA.name < propB.name) return -1;
      if (propA.name > propB.name) return 1;
      return 0;
    })
    .forEach(propertyModel => {
      markdownFile.addTitle(`\`${propertyModel.name}\` → \`${propertyModel.type}\``, startingHeadingLevel + 2);

      propertyModel.annotations.forEach(annotation => {
        markdownFile.addBlankLine();
        markdownFile.addText(`\`${annotation.type}\``);
      });

      if (propertyModel.docComment?.description) {
        markdownFile.addBlankLine();
        markdownFile.addText(propertyModel.docComment.description);
      }
      markdownFile.addBlankLine();
    });

  markdownFile.addHorizontalRule();
}
