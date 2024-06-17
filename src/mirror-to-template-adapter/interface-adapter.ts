import { InterfaceMirror } from '@cparra/apex-reflection';
import { InterfaceSource } from '../templating/types';
import {
  documentationLinesToRenderableContent,
  extractAnnotationBody,
  extractAnnotationBodyLines,
  extractCustomTags,
  extractSeeAnnotations,
} from './apex-doc-adapters';
import { linkFromTypeNameGenerator } from './references';
import { MethodMirrorWithInheritance } from '../model/inheritance';

// TODO: All type adapters can live in the same file

export function interfaceTypeToInterfaceSource(interfaceType: InterfaceMirror): InterfaceSource {
  return {
    __type: 'interface',
    name: interfaceType.name,
    accessModifier: interfaceType.access_modifier,
    annotations: interfaceType.annotations.map((annotation) => annotation.type.toUpperCase()),
    description: documentationLinesToRenderableContent(interfaceType.docComment?.descriptionLines),
    group: extractAnnotationBody(interfaceType, 'group'),
    author: extractAnnotationBody(interfaceType, 'author'),
    date: extractAnnotationBody(interfaceType, 'date'),
    customTags: extractCustomTags(interfaceType),
    sees: extractSeeAnnotations(interfaceType).map(linkFromTypeNameGenerator),
    extends: interfaceType.extended_interfaces.map(linkFromTypeNameGenerator),
    mermaid: extractAnnotationBodyLines(interfaceType, 'mermaid'),
    methods: interfaceType.methods.map((method) => ({
      declaration: buildDeclaration(method as MethodMirrorWithInheritance),
      description: documentationLinesToRenderableContent(method.docComment?.descriptionLines),
      annotations: method.annotations.map((annotation) => annotation.type.toUpperCase()),
      returnType: {
        type: method.typeReference.rawDeclaration,
        description: documentationLinesToRenderableContent(method.docComment?.returnAnnotation?.bodyLines),
      },
      throws: method.docComment?.throwsAnnotations.map((thrown) => ({
        type: thrown.exceptionName,
        description: documentationLinesToRenderableContent(thrown.bodyLines),
      })),
      parameters: method.parameters.map((param) => {
        const paramAnnotation = method.docComment?.paramAnnotations.find(
          (pa) => pa.paramName.toLowerCase() === param.name.toLowerCase(),
        );
        return {
          name: param.name,
          type: param.typeReference.rawDeclaration,
          description: paramAnnotation ? documentationLinesToRenderableContent(paramAnnotation.bodyLines) : undefined,
        };
      }),
      customTags: extractCustomTags(method),
      mermaid: extractAnnotationBodyLines(method, 'mermaid'),
    })),
  };
}

function buildDeclaration(method: MethodMirrorWithInheritance): string {
  const { access_modifier, typeReference, name } = method;
  const parameters = method.parameters.map((param) => `${param.typeReference.rawDeclaration} ${param.name}`).join(', ');
  return `${access_modifier} ${typeReference.rawDeclaration} ${name}(${parameters})`;
}
