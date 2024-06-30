import { ConstructorMirror, MethodMirror, ParameterMirror, ThrowsAnnotation } from '@cparra/apex-reflection';
import { RenderableConstructor, RenderableMethod } from '../templating/types';
import { MethodMirrorWithInheritance } from '../model/inheritance';
import { adaptDescribable, adaptDocumentable } from './documentables';
import { linkFromTypeNameGenerator } from './references';
import { Documentable } from './types';

export function adaptMethod(method: MethodMirror, baseHeadingLevel: number): RenderableMethod {
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
    headingLevel: baseHeadingLevel,
    doc: adaptDocumentable(method, baseHeadingLevel + 1),
    heading: buildTitle(method as MethodMirrorWithInheritance),
    signature: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Signature',
      value: [buildSignature(method as MethodMirrorWithInheritance)],
    },
    returnType: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Return Type',
      value: {
        ...adaptDescribable(method.docComment?.returnAnnotation?.bodyLines),
        type: linkFromTypeNameGenerator(method.typeReference.rawDeclaration),
      },
    },
    throws: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Throws',
      value: method.docComment?.throwsAnnotations.map((thrown) => mapThrows(thrown)),
    },
    parameters: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Parameters',
      value: method.parameters.map((param) => mapParameters(method, param)),
    },
    inherited: (method as MethodMirrorWithInheritance).inherited,
  };
}

export function adaptConstructor(
  typeName: string,
  constructor: ConstructorMirror,
  baseHeadingLevel: number,
): RenderableConstructor {
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
    doc: adaptDocumentable(constructor, baseHeadingLevel + 1),
    headingLevel: baseHeadingLevel,
    heading: buildTitle(typeName, constructor),
    signature: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Signature',
      value: [buildSignature(typeName, constructor)],
    },
    parameters: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Parameters',
      value: constructor.parameters.map((param) => mapParameters(constructor, param)),
    },
    throws: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Throws',
      value: constructor.docComment?.throwsAnnotations.map((thrown) => mapThrows(thrown)),
    },
  };
}

function mapParameters(documentable: Documentable, param: ParameterMirror) {
  const paramAnnotation = documentable.docComment?.paramAnnotations.find(
    (pa) => pa.paramName.toLowerCase() === param.name.toLowerCase(),
  );
  return {
    ...adaptDescribable(paramAnnotation?.bodyLines),
    name: param.name,
    type: linkFromTypeNameGenerator(param.typeReference.rawDeclaration),
  };
}

function mapThrows(thrown: ThrowsAnnotation) {
  return {
    ...adaptDescribable(thrown.bodyLines),
    type: linkFromTypeNameGenerator(thrown.exceptionName),
  };
}
