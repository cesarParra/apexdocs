import {
  CodeBlock,
  FieldMirrorWithInheritance,
  PropertyMirrorWithInheritance,
  RenderableField,
  GetRenderableContentByTypeName,
} from '../../renderables/types';
import { adaptDocumentable } from '../../renderables/documentables';

export function adaptFieldOrProperty(
  field: FieldMirrorWithInheritance | PropertyMirrorWithInheritance,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
): RenderableField {
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
      heading: 'Type',
      value: linkGenerator(field.typeReference.rawDeclaration),
    },
    inherited: field.inherited,
    accessModifier: field.access_modifier,
    signature: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Signature',
      value: buildSignature(),
    },
  };
}
