import { FieldMirrorWithInheritance } from '../model/inheritance';
import { FieldSource } from '../templating/types';
import { adaptDocumentable } from './documentables';
import { linkFromTypeNameGenerator } from './references';

export function adaptField(field: FieldMirrorWithInheritance): FieldSource {
  return {
    ...adaptDocumentable(field),
    name: field.name,
    type: linkFromTypeNameGenerator(field.typeReference.rawDeclaration),
    inherited: field.inherited,
    accessModifier: field.access_modifier,
  };
}
