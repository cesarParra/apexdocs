import { ConstructorMirror, MethodMirror, ParameterMirror, ThrowsAnnotation } from '@cparra/apex-reflection';
import {
  RenderableConstructor,
  RenderableMethod,
  MethodMirrorWithInheritance,
  CodeBlock,
  GetRenderableContentByTypeName,
} from '../../renderables/types';
import { adaptDescribable, adaptDocumentable } from '../../renderables/documentables';
import { Documentable } from '../../renderables/types';
import { Translations } from '../../translations';

export function adaptMethod(
  method: MethodMirror,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
  translations: Translations,
): RenderableMethod {
  function buildTitle(method: MethodMirrorWithInheritance): string {
    const { name, parameters } = method;
    const parametersString = parameters.map((param) => param.name).join(', ');
    return `${name}(${parametersString})`;
  }

  function buildSignature(method: MethodMirrorWithInheritance): CodeBlock {
    const { access_modifier, typeReference, name, memberModifiers } = method;
    const parameters = method.parameters
      .map((param) => `${param.typeReference.rawDeclaration} ${param.name}`)
      .join(', ');
    const members = memberModifiers.length > 0 ? `${memberModifiers.join(' ')} ` : '';
    return {
      __type: 'code-block',
      language: 'apex',
      content: [`${access_modifier} ${members}${typeReference.rawDeclaration} ${name}(${parameters})`],
    };
  }

  return {
    headingLevel: baseHeadingLevel,
    doc: adaptDocumentable(method, linkGenerator, baseHeadingLevel + 1),
    heading: buildTitle(method as MethodMirrorWithInheritance),
    signature: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.details.signature,
      value: buildSignature(method as MethodMirrorWithInheritance),
    },
    returnType: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.details.returnType,
      value: {
        ...adaptDescribable(method.docComment?.returnAnnotation?.bodyLines, linkGenerator),
        type: linkGenerator(method.typeReference.rawDeclaration),
      },
    },
    throws: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.details.throws,
      value: method.docComment?.throwsAnnotations.map((thrown) => mapThrows(thrown, linkGenerator)),
    },
    parameters: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.details.parameters,
      value: method.parameters.map((param) => mapParameters(method, param, linkGenerator)),
    },
    inherited: (method as MethodMirrorWithInheritance).inherited,
  };
}

export function adaptConstructor(
  typeName: string,
  constructor: ConstructorMirror,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
  translations: Translations,
): RenderableConstructor {
  function buildTitle(name: string, constructor: ConstructorMirror): string {
    const { parameters } = constructor;
    const parametersString = parameters.map((param) => param.name).join(', ');
    return `${name}(${parametersString})`;
  }

  function buildSignature(name: string, constructor: ConstructorMirror): CodeBlock {
    const { access_modifier } = constructor;
    const parameters = constructor.parameters
      .map((param) => `${param.typeReference.rawDeclaration} ${param.name}`)
      .join(', ');
    return {
      __type: 'code-block',
      language: 'apex',
      content: [`${access_modifier} ${name}(${parameters})`],
    };
  }

  return {
    doc: adaptDocumentable(constructor, linkGenerator, baseHeadingLevel + 1),
    headingLevel: baseHeadingLevel,
    heading: buildTitle(typeName, constructor),
    signature: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.details.signature,
      value: buildSignature(typeName, constructor),
    },
    parameters: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.details.parameters,
      value: constructor.parameters.map((param) => mapParameters(constructor, param, linkGenerator)),
    },
    throws: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.details.throws,
      value: constructor.docComment?.throwsAnnotations.map((thrown) => mapThrows(thrown, linkGenerator)),
    },
  };
}

function mapParameters(
  documentable: Documentable,
  param: ParameterMirror,
  linkGenerator: GetRenderableContentByTypeName,
) {
  const paramAnnotation = documentable.docComment?.paramAnnotations.find(
    (pa) => pa.paramName.toLowerCase() === param.name.toLowerCase(),
  );
  return {
    ...adaptDescribable(paramAnnotation?.bodyLines, linkGenerator),
    name: param.name,
    type: linkGenerator(param.typeReference.rawDeclaration),
  };
}

function mapThrows(thrown: ThrowsAnnotation, linkGenerator: GetRenderableContentByTypeName) {
  return {
    ...adaptDescribable(thrown.bodyLines, linkGenerator),
    type: linkGenerator(thrown.exceptionName),
  };
}
