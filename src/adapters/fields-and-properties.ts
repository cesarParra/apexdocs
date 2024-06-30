import { FieldMirrorWithInheritance, PropertyMirrorWithInheritance } from '../model/inheritance';
import { RenderableField } from '../templating/types';
import { adaptDocumentable } from './documentables';
import { linkFromTypeNameGenerator } from './references';

export function adaptFieldOrProperty(
  field: FieldMirrorWithInheritance | PropertyMirrorWithInheritance,
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
    doc: adaptDocumentable(field, 4),
    name: field.name,
    type: linkFromTypeNameGenerator(field.typeReference.rawDeclaration),
    inherited: field.inherited,
    accessModifier: field.access_modifier,
    signature: buildSignature(),
  };
}
