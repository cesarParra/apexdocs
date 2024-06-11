import { InterfaceMirror } from '@cparra/apex-reflection';
import { InterfaceSource } from '../templating/types';
import {
  docCommentDescriptionToRenderableContent,
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
    description: docCommentDescriptionToRenderableContent(interfaceType.docComment),
    group: extractAnnotationBody(interfaceType, 'group'),
    author: extractAnnotationBody(interfaceType, 'author'),
    date: extractAnnotationBody(interfaceType, 'date'),
    customTags: extractCustomTags(interfaceType),
    sees: extractSeeAnnotations(interfaceType).map(linkFromTypeNameGenerator),
    extends: interfaceType.extended_interfaces.map(linkFromTypeNameGenerator),
    mermaid: extractAnnotationBodyLines(interfaceType, 'mermaid'),
    methods: interfaceType.methods.map((method) => ({
      declaration: buildDeclaration(method as MethodMirrorWithInheritance),
      description: docCommentDescriptionToRenderableContent(method.docComment),
    })),
  };
}

function buildDeclaration(method: MethodMirrorWithInheritance): string {
  const { access_modifier, typeReference, name } = method;
  const parameters = method.parameters.map((param) => `${param.typeReference.rawDeclaration} ${param.name}`).join(', ');
  return `${access_modifier} ${typeReference.rawDeclaration} ${name}(${parameters})`;
}
