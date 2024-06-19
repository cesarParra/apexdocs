import {
  ClassMirror,
  ConstructorMirror,
  EnumMirror,
  InterfaceMirror,
  MethodMirror,
  ParameterMirror,
  Type,
} from '@cparra/apex-reflection';
import {
  BaseTypeSource,
  ClassSource,
  ConstructorSource,
  EnumSource,
  InterfaceSource,
  MethodSource,
  FieldSource,
} from '../templating/types';
import { linkFromTypeNameGenerator } from './references';
import { FieldMirrorWithInheritance, MethodMirrorWithInheritance } from '../model/inheritance';
import { ThrowsAnnotation } from '@cparra/apex-reflection';
import { adaptDocumentable, describableToRenderableContent } from './documentable';
import { Documentable } from './types';

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
      value: value.name,
      description: describableToRenderableContent(value.docComment?.descriptionLines),
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

function adaptMethod(method: MethodMirror): MethodSource {
  function buildTitle(method: MethodMirrorWithInheritance): string {
    const { name, parameters } = method;
    const parametersString = parameters.map((param) => param.name).join(', ');
    return `${name}(${parametersString})`;
  }

  function buildSignature(method: MethodMirrorWithInheritance): string {
    const { access_modifier, typeReference, name, memberModifiers } = method;
    const parameters = method.parameters
      .map((param) => `${param.typeReference.rawDeclaration} ${param.name}`)
      .join(', ');
    const members = memberModifiers.length > 0 ? `${memberModifiers.join(' ')} ` : '';
    return `${access_modifier} ${members}${typeReference.rawDeclaration} ${name}(${parameters})`;
  }

  return {
    ...adaptDocumentable(method),
    title: buildTitle(method as MethodMirrorWithInheritance),
    signature: buildSignature(method as MethodMirrorWithInheritance),
    returnType: {
      type: linkFromTypeNameGenerator(method.typeReference.rawDeclaration),
      description: describableToRenderableContent(method.docComment?.returnAnnotation?.bodyLines),
    },
    throws: method.docComment?.throwsAnnotations.map((thrown) => mapThrows(thrown)),
    parameters: method.parameters.map((param) => mapParameters(method, param)),
    inherited: (method as MethodMirrorWithInheritance).inherited,
  };
}

function adaptConstructor(typeName: string, constructor: ConstructorMirror): ConstructorSource {
  function buildTitle(name: string, constructor: ConstructorMirror): string {
    const { parameters } = constructor;
    const parametersString = parameters.map((param) => param.name).join(', ');
    return `${name}(${parametersString})`;
  }

  function buildSignature(name: string, constructor: ConstructorMirror): string {
    const { access_modifier } = constructor;
    const parameters = constructor.parameters
      .map((param) => `${param.typeReference.rawDeclaration} ${param.name}`)
      .join(', ');
    return `${access_modifier} ${name}(${parameters})`;
  }

  return {
    ...adaptDocumentable(constructor),
    title: buildTitle(typeName, constructor),
    signature: buildSignature(typeName, constructor),
    parameters: constructor.parameters.map((param) => mapParameters(constructor, param)),
    throws: constructor.docComment?.throwsAnnotations.map((thrown) => mapThrows(thrown)),
  };
}

function adaptField(field: FieldMirrorWithInheritance): FieldSource {
  return {
    ...adaptDocumentable(field),
    name: field.name,
    type: linkFromTypeNameGenerator(field.typeReference.rawDeclaration),
    inherited: field.inherited,
    accessModifier: field.access_modifier,
  };
}

function mapParameters(documentable: Documentable, param: ParameterMirror) {
  const paramAnnotation = documentable.docComment?.paramAnnotations.find(
    (pa) => pa.paramName.toLowerCase() === param.name.toLowerCase(),
  );
  return {
    name: param.name,
    type: linkFromTypeNameGenerator(param.typeReference.rawDeclaration),
    description: paramAnnotation ? describableToRenderableContent(paramAnnotation.bodyLines) : undefined,
  };
}

function mapThrows(thrown: ThrowsAnnotation) {
  return {
    type: linkFromTypeNameGenerator(thrown.exceptionName),
    description: describableToRenderableContent(thrown.bodyLines),
  };
}
