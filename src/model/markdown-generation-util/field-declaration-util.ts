import { MarkdownFile } from '../markdown-file';
import { FieldMirrorWithInheritance, FieldOrProperty, PropertyMirrorWithInheritance } from '../inheritance';

export function declareField(
  markdownFile: MarkdownFile,
  fields: FieldMirrorWithInheritance[] | PropertyMirrorWithInheritance[],
  startingHeadingLevel: number,
  grouped = false,
) {
  markdownFile.addBlankLine();
  fields.forEach((propertyModel) => {
    addFieldSection(markdownFile, propertyModel, startingHeadingLevel, grouped);
  });

  markdownFile.addHorizontalRule();
}

function addFieldSection(
  markdownFile: MarkdownFile,
  mirrorModel: FieldOrProperty,
  startingHeadingLevel: number,
  grouped: boolean,
) {
  if (!grouped) {
    markdownFile.addTitle(
      `\`${mirrorModel.access_modifier} ${mirrorModel.name}\` → \`${mirrorModel.typeReference.rawDeclaration}\``,
      startingHeadingLevel + 2,
    );
    markdownFile.addBlankLine();
    if (mirrorModel.inherited) {
      markdownFile.addText('*Inherited*');
    }

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

    let listItemText = `\`${mirrorModel.access_modifier} ${mirrorModel.name}\` → \`${mirrorModel.typeReference.rawDeclaration}\``;
    if (mirrorModel.inherited) {
      listItemText += '(*Inherited*)';
    }
    listItemText += `${annotations} ${description}`;

    markdownFile.addListItem(listItemText);
    markdownFile.addBlankLine();
  }
}
