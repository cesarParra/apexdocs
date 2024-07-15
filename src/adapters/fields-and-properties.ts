import { FieldMirrorWithInheritance, PropertyMirrorWithInheritance } from '../model/inheritance';
import { RenderableField } from '../core/renderable/types';
import { adaptDocumentable } from './documentables';
import { GetRenderableContentByTypeName } from './references';

export function adaptFieldOrProperty(
  field: FieldMirrorWithInheritance | PropertyMirrorWithInheritance,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
): RenderableField {
  function buildSignature() {
    const { access_modifier, name } = field;
    const memberModifiers = field.memberModifiers.join(' ');
    return (
      `${access_modifier} ${memberModifiers} ${name}`
        // remove double spaces
        .replace(/ {2}/g, ' ')
    );
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
      value: [buildSignature()],
    },
  };
}
