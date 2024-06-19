import {
  Annotation,
  ClassMirror,
  ConstructorMirror,
  DocComment,
  EnumMirror,
  InterfaceMirror,
  MethodMirror,
  ParameterMirror,
} from '@cparra/apex-reflection';
import {
  BaseDocAwareSource,
  BaseTypeSource,
  ClassSource,
  ConstructorSource,
  EnumSource,
  InterfaceSource,
  MethodSource,
} from '../templating/types';
import { linkFromTypeNameGenerator } from './references';
import {
  documentationLinesToRenderableContent,
  extractAnnotationBody,
  extractAnnotationBodyLines,
  extractCustomTags,
  extractSeeAnnotations,
} from './apex-doc-adapters';
import { MethodMirrorWithInheritance } from '../model/inheritance';
import { ThrowsAnnotation } from '@cparra/apex-reflection/index';

type Documentable = {
  annotations: Annotation[];
  docComment?: DocComment;
};

function baseDocumentableAdapter(documentable: Documentable): BaseDocAwareSource {
  return {
    annotations: documentable.annotations.map((annotation) => annotation.type.toUpperCase()),
    description: documentationLinesToRenderableContent(documentable.docComment?.descriptionLines),
    customTags: extractCustomTags(documentable),
    mermaid: extractAnnotationBodyLines(documentable, 'mermaid'),
    example: documentable.docComment?.exampleAnnotation?.bodyLines,
  };
}

function baseTypeAdapter(type: EnumMirror | InterfaceMirror | ClassMirror): BaseTypeSource {
  return {
    ...baseDocumentableAdapter(type),
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
      description: documentationLinesToRenderableContent(value.docComment?.descriptionLines),
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
  };
}

function adaptMethod(method: MethodMirror): MethodSource {
  function buildTitle(method: MethodMirrorWithInheritance): string {
    const { name, parameters } = method;
    const parametersString = parameters.map((param) => param.name).join(', ');
    return `${name}(${parametersString})`;
  }

  function buildSignature(method: MethodMirrorWithInheritance): string {
    const { access_modifier, typeReference, name } = method;
    const parameters = method.parameters
      .map((param) => `${param.typeReference.rawDeclaration} ${param.name}`)
      .join(', ');
    return `${access_modifier} ${typeReference.rawDeclaration} ${name}(${parameters})`;
  }

  return {
    ...baseDocumentableAdapter(method),
    title: buildTitle(method as MethodMirrorWithInheritance),
    signature: buildSignature(method as MethodMirrorWithInheritance),
    returnType: {
      type: linkFromTypeNameGenerator(method.typeReference.rawDeclaration),
      description: documentationLinesToRenderableContent(method.docComment?.returnAnnotation?.bodyLines),
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
    ...baseDocumentableAdapter(constructor),
    title: buildTitle(typeName, constructor),
    signature: buildSignature(typeName, constructor),
    parameters: constructor.parameters.map((param) => mapParameters(constructor, param)),
    throws: constructor.docComment?.throwsAnnotations.map((thrown) => mapThrows(thrown)),
  };
}

function mapParameters(documentable: Documentable, param: ParameterMirror) {
  const paramAnnotation = documentable.docComment?.paramAnnotations.find(
    (pa) => pa.paramName.toLowerCase() === param.name.toLowerCase(),
  );
  return {
    name: param.name,
    type: linkFromTypeNameGenerator(param.typeReference.rawDeclaration),
    description: paramAnnotation ? documentationLinesToRenderableContent(paramAnnotation.bodyLines) : undefined,
  };
}

function mapThrows(thrown: ThrowsAnnotation) {
  return {
    type: linkFromTypeNameGenerator(thrown.exceptionName),
    description: documentationLinesToRenderableContent(thrown.bodyLines),
  };
}
