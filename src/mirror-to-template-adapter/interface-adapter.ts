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
    })),
  };
}

// TODO: Unit test all of this and then refactor
function buildDeclaration(method: MethodMirrorWithInheritance): string {
  const signatureName = `${(method as MethodMirrorWithInheritance).typeReference.rawDeclaration} ${
    (method as MethodMirrorWithInheritance).name
  }`;

  return buildSignature(method.access_modifier, signatureName, method);
}

function buildSignature(accessModifier: string, name: string, parameterAware: MethodMirrorWithInheritance): string {
  let signature = `${name}(`;
  if ((parameterAware as MethodMirrorWithInheritance).memberModifiers.length) {
    signature =
      accessModifier +
      ' ' +
      (parameterAware as MethodMirrorWithInheritance).memberModifiers.join(' ') +
      ' ' +
      signature;
  } else {
    signature = accessModifier + ' ' + signature;
  }
  const signatureParameters = parameterAware.parameters.map(
    (param) => `${param.typeReference.rawDeclaration} ${param.name}`,
  );
  signature += signatureParameters.join(', ');
  return `${signature})`;
}
