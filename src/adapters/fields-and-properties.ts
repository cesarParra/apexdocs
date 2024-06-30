import { FieldMirrorWithInheritance, PropertyMirrorWithInheritance } from '../model/inheritance';
import { FieldSource } from '../templating/types';
import { adaptDocumentable } from './documentables';
import { linkFromTypeNameGenerator } from './references';

export function adaptFieldOrProperty(field: FieldMirrorWithInheritance | PropertyMirrorWithInheritance): FieldSource {
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
    ...adaptDocumentable(field),
    name: field.name,
    type: linkFromTypeNameGenerator(field.typeReference.rawDeclaration),
    inherited: field.inherited,
    accessModifier: field.access_modifier,
    signature: buildSignature(),
  };
}
