import { InterfaceMirror } from '@cparra/apex-reflection';
import { InterfaceSource } from '../templating/types';
import {
  docCommentDescriptionToRenderableContent,
  extractAnnotation,
  extractCustomTags,
  extractSeeAnnotations,
} from './apex-doc-adapters';
import { linkFromTypeNameGenerator } from './references';

// TODO: All type adapters can live in the same file

export function interfaceTypeToInterfaceSource(interfaceType: InterfaceMirror): InterfaceSource {
  return {
    __type: 'interface',
    name: interfaceType.name,
    accessModifier: interfaceType.access_modifier,
    annotations: interfaceType.annotations.map((annotation) => annotation.type.toUpperCase()),
    description: docCommentDescriptionToRenderableContent(interfaceType.docComment),
    group: extractAnnotation(interfaceType, 'group'),
    author: extractAnnotation(interfaceType, 'author'),
    date: extractAnnotation(interfaceType, 'date'),
    customTags: extractCustomTags(interfaceType),
    sees: extractSeeAnnotations(interfaceType).map(linkFromTypeNameGenerator),
    extends: interfaceType.extended_interfaces.map(linkFromTypeNameGenerator),
  };
}
