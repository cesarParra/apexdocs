import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { BaseTypeSource, ClassSource, EnumSource, InterfaceSource } from '../templating/types';
import { adaptDescribable, adaptDocumentable } from './documentable';
import { linkFromTypeNameGenerator } from './references';
import { FieldMirrorWithInheritance } from '../model/inheritance';
import { adaptConstructor, adaptMethod } from './methods-and-constructors';
import { adaptField } from './fields-and-properties';

// TODO: Unit tests
function baseTypeAdapter(type: EnumMirror | InterfaceMirror | ClassMirror): BaseTypeSource {
  function extractAnnotationBody(type: Type, annotationName: string): string | undefined {
    return type.docComment?.annotations.find(
      (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName,
    )?.body;
  }

  function extractSeeAnnotations(type: Type): string[] {
    return (
      type.docComment?.annotations
        .filter((currentAnnotation) => currentAnnotation.name.toLowerCase() === 'see')
        .map((currentAnnotation) => currentAnnotation.body) ?? []
    );
  }

  return {
    ...adaptDocumentable(type),
    accessModifier: type.access_modifier,
    name: type.name,
    group: extractAnnotationBody(type, 'group'),
    author: extractAnnotationBody(type, 'author'),
    date: extractAnnotationBody(type, 'date'),
    sees: extractSeeAnnotations(type).map(linkFromTypeNameGenerator),
  };
}

export function enumTypeToEnumSource(enumType: EnumMirror): EnumSource {
  return {
    __type: 'enum',
    ...baseTypeAdapter(enumType),
    values: enumType.values.map((value) => ({
      ...adaptDescribable(value.docComment?.descriptionLines),
      value: value.name,
    })),
  };
}

export function interfaceTypeToInterfaceSource(interfaceType: InterfaceMirror): InterfaceSource {
  return {
    __type: 'interface',
    ...baseTypeAdapter(interfaceType),
    extends: interfaceType.extended_interfaces.map(linkFromTypeNameGenerator),
    methods: interfaceType.methods.map(adaptMethod),
  };
}

export function classTypeToClassSource(classType: ClassMirror): ClassSource {
  return {
    __type: 'class',
    ...baseTypeAdapter(classType),
    classModifier: classType.classModifier,
    sharingModifier: classType.sharingModifier,
    implements: classType.implemented_interfaces.map(linkFromTypeNameGenerator),
    extends: classType.extended_class ? linkFromTypeNameGenerator(classType.extended_class) : undefined,
    methods: classType.methods.map(adaptMethod),
    constructors: classType.constructors.map((constructor) => adaptConstructor(classType.name, constructor)),
    fields: classType.fields.map((field) => adaptField(field as FieldMirrorWithInheritance)),
  };
}
