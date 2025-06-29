import {
  CodeBlock,
  FieldMirrorWithInheritance,
  PropertyMirrorWithInheritance,
  RenderableApexField,
  GetRenderableContentByTypeName,
} from '../../renderables/types';
import { adaptDocumentable } from '../../renderables/documentables';
import { Translations } from '../../translations';

export function adaptFieldOrProperty(
  field: FieldMirrorWithInheritance | PropertyMirrorWithInheritance,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
  translations: Translations,
): RenderableApexField {
  function buildSignature(): CodeBlock {
    const { access_modifier, name } = field;
    const memberModifiers = field.memberModifiers.join(' ');
    const codeContents = `${access_modifier} ${memberModifiers} ${name}`
      // remove double spaces
      .replace(/ {2}/g, ' ');
    return {
      __type: 'code-block',
      language: 'apex',
      content: [codeContents],
    };
  }

  return {
    headingLevel: baseHeadingLevel,
    doc: adaptDocumentable(field, linkGenerator, baseHeadingLevel + 1),
    heading: field.name,
    type: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.details.type,
      value: linkGenerator(field.typeReference.rawDeclaration),
    },
    inherited: field.inherited,
    accessModifier: field.access_modifier,
    signature: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.details.signature,
      value: buildSignature(),
    },
  };
}
