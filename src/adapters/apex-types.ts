import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { BaseTypeSource } from '../templating/types';
import { adaptDocumentable } from './documentable';
import { linkFromTypeNameGenerator } from './references';

// TODO: Unit tests
export function baseTypeAdapter(type: EnumMirror | InterfaceMirror | ClassMirror): BaseTypeSource {
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
