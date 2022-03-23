import { MarkdownFile } from '../markdown-file';
import { FieldMirror, PropertyMirror } from '@cparra/apex-reflection';

export function declareField(
  markdownFile: MarkdownFile,
  fields: FieldMirror[] | PropertyMirror[],
  startingHeadingLevel: number,
  grouped = false,
) {
  markdownFile.addBlankLine();
  fields
    .sort((propA, propB) => {
      if (propA.name < propB.name) return -1;
      if (propA.name > propB.name) return 1;
      return 0;
    })
    .forEach((propertyModel) => {
      addFieldSection(markdownFile, propertyModel, startingHeadingLevel, grouped);
    });

  markdownFile.addHorizontalRule();
}

function addFieldSection(
  markdownFile: MarkdownFile,
  mirrorModel: FieldMirror | PropertyMirror,
  startingHeadingLevel: number,
  grouped: boolean,
) {
  if (!grouped) {
    markdownFile.addTitle(`\`${mirrorModel.name}\` → \`${mirrorModel.type}\``, startingHeadingLevel + 2);
    markdownFile.addBlankLine();

    mirrorModel.annotations.forEach((annotation) => {
      markdownFile.addText(`\`${annotation.type.toUpperCase()}\` `);
    });

    if (mirrorModel.docComment?.description) {
      markdownFile.addBlankLine();
      markdownFile.addText(mirrorModel.docComment.description);
    }
    markdownFile.addBlankLine();
  } else {
    let annotations = '';
    const hasAnnotations = !!mirrorModel.annotations.length;
    if (hasAnnotations) {
      annotations += ' [';
    }
    mirrorModel.annotations.forEach((annotation) => {
      annotations += `\`${annotation.type.toUpperCase()}\` `;
    });
    if (hasAnnotations) {
      annotations += ']';
    }

    // If grouped we want to display these as a list
    let description = '';
    if (mirrorModel.docComment?.description) {
      description = ` - ${mirrorModel.docComment?.description}`;
    }
    markdownFile.addListItem(`\`${mirrorModel.name}\` → \`${mirrorModel.type}\`${annotations} ${description}`);
    markdownFile.addBlankLine();
  }
}
