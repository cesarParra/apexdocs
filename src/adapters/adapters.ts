import { ClassMirror, EnumMirror, InterfaceMirror, MethodMirror } from '@cparra/apex-reflection';
import { ClassSource, EnumSource, InterfaceSource, MethodSource } from '../templating/types';
import { linkFromTypeNameGenerator } from './references';
import {
  documentationLinesToRenderableContent,
  extractAnnotationBody,
  extractAnnotationBodyLines,
  extractCustomTags,
  extractSeeAnnotations,
} from './apex-doc-adapters';
import { MethodMirrorWithInheritance } from '../model/inheritance';

function baseAdapter(type: EnumMirror | InterfaceMirror | ClassMirror) {
  return {
    accessModifier: type.access_modifier,
    name: type.name,
    annotations: type.annotations.map((annotation) => annotation.type.toUpperCase()),
    description: documentationLinesToRenderableContent(type.docComment?.descriptionLines),
    group: extractAnnotationBody(type, 'group'),
    author: extractAnnotationBody(type, 'author'),
    date: extractAnnotationBody(type, 'date'),
    customTags: extractCustomTags(type),
    sees: extractSeeAnnotations(type).map(linkFromTypeNameGenerator),
    mermaid: extractAnnotationBodyLines(type, 'mermaid'),
    example: type.docComment?.exampleAnnotation?.bodyLines,
  };
}

export function enumTypeToEnumSource(enumType: EnumMirror): EnumSource {
  return {
    __type: 'enum',
    ...baseAdapter(enumType),
    values: enumType.values.map((value) => ({
      value: value.name,
      description: documentationLinesToRenderableContent(value.docComment?.descriptionLines),
    })),
  };
}

export function interfaceTypeToInterfaceSource(interfaceType: InterfaceMirror): InterfaceSource {
  return {
    __type: 'interface',
    ...baseAdapter(interfaceType),
    extends: interfaceType.extended_interfaces.map(linkFromTypeNameGenerator),
    methods: interfaceType.methods.map(adaptMethod),
  };
}

export function classTypeToClassSource(classType: ClassMirror): ClassSource {
  return {
    __type: 'class',
    ...baseAdapter(classType),
    classModifier: classType.classModifier,
    sharingModifier: classType.sharingModifier,
    implements: classType.implemented_interfaces.map(linkFromTypeNameGenerator),
  };
}

function adaptMethod(method: MethodMirror): MethodSource {
  return {
    title: buildTitle(method as MethodMirrorWithInheritance),
    signature: buildSignature(method as MethodMirrorWithInheritance),
    description: documentationLinesToRenderableContent(method.docComment?.descriptionLines),
    annotations: method.annotations.map((annotation) => annotation.type.toUpperCase()),
    returnType: {
      type: linkFromTypeNameGenerator(method.typeReference.rawDeclaration),
      description: documentationLinesToRenderableContent(method.docComment?.returnAnnotation?.bodyLines),
    },
    throws: method.docComment?.throwsAnnotations.map((thrown) => ({
      type: linkFromTypeNameGenerator(thrown.exceptionName),
      description: documentationLinesToRenderableContent(thrown.bodyLines),
    })),
    parameters: method.parameters.map((param) => {
      const paramAnnotation = method.docComment?.paramAnnotations.find(
        (pa) => pa.paramName.toLowerCase() === param.name.toLowerCase(),
      );
      return {
        name: param.name,
        type: linkFromTypeNameGenerator(param.typeReference.rawDeclaration),
        description: paramAnnotation ? documentationLinesToRenderableContent(paramAnnotation.bodyLines) : undefined,
      };
    }),
    customTags: extractCustomTags(method),
    mermaid: extractAnnotationBodyLines(method, 'mermaid'),
    example: method.docComment?.exampleAnnotation?.bodyLines,
    inherited: (method as MethodMirrorWithInheritance).inherited,
  };
}

function buildTitle(method: MethodMirrorWithInheritance): string {
  const { name, parameters } = method;
  const parametersString = parameters.map((param) => param.name).join(', ');
  return `${name}(${parametersString})`;
}

function buildSignature(method: MethodMirrorWithInheritance): string {
  const { access_modifier, typeReference, name } = method;
  const parameters = method.parameters.map((param) => `${param.typeReference.rawDeclaration} ${param.name}`).join(', ');
  return `${access_modifier} ${typeReference.rawDeclaration} ${name}(${parameters})`;
}
