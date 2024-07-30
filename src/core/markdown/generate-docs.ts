import { ClassMirror, InterfaceMirror, reflect as mirrorReflection, Type } from '@cparra/apex-reflection';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';

import { typeToRenderable } from './adapters/apex-types';
import { Link, Renderable, RenderableContent, RenderableEnum, StringOrLink } from './adapters/types';
import { CompilationRequest, Template } from './template';
import { referenceGuideTemplate } from './templates/reference-guide';
import { adaptDescribable } from './adapters/documentables';
import { createInheritanceChain } from './inheritance-chain';
import ApexBundle from '../apex-bundle';
import Manifest from '../manifest';
import MetadataProcessor from '../../service/metadata-processor';
import { enumMarkdownTemplate } from './templates/enum-template';
import { interfaceMarkdownTemplate } from './templates/interface-template';
import { classMarkdownTemplate } from './templates/class-template';
import { apply } from '#utils/fp';

export type DocumentationBundle = {
  format: 'markdown';
  referenceGuide: string; // Output file with links to all other files (e.g. index/table of contents)
  docs: DocOutput[];
};

type DocumentationConfig = {
  scope: string[];
  outputDir: string;
  namespace?: string;
  sortMembersAlphabetically?: boolean;
  defaultGroupName: string;
  referenceGuideTemplate: string;
};

type DocOutput = {
  directory: string;
  docContents: string;
  typeName: string;
  type: 'class' | 'interface' | 'enum';
};

const configDefaults: DocumentationConfig = {
  scope: ['public'],
  outputDir: 'docs',
  defaultGroupName: 'Miscellaneous',
  referenceGuideTemplate: referenceGuideTemplate,
};

export function generateDocs(
  apexBundles: ApexBundle[],
  config?: Partial<DocumentationConfig>,
): E.Either<ReflectionError[], DocumentationBundle> {
  const configWithDefaults = { ...configDefaults, ...config };

  const filterOutOfScope = apply(filterTypesOutOfScope, configWithDefaults.scope);
  const convertToRenderableBundle = apply(typesToRenderableBundle, configWithDefaults);
  const addInheritedMembersToTypes = (types: Type[]) => types.map((type) => addInheritedMembers(types, type));
  const addInheritanceChainToTypes = (types: Type[]) => types.map((type) => addInheritanceChain(type, types));
  const convertToDocumentationBundle = ({ references, renderables }: RenderableBundle): DocumentationBundle => ({
    format: 'markdown',
    referenceGuide: referencesToReferenceGuide(references, configWithDefaults.referenceGuideTemplate),
    docs: renderables.map((renderable: Renderable) =>
      renderableToOutputDoc(Object.values(references).flat(), renderable),
    ),
  });

  return pipe(
    apexBundles,
    reflectSourceCode,
    checkForReflectionErrors,
    E.map(filterOutOfScope),
    E.map(addInheritedMembersToTypes),
    E.map(addInheritanceChainToTypes),
    E.map(convertToRenderableBundle),
    E.map(convertToDocumentationBundle),
  );
}

function reflectSourceCode(apexBundles: ApexBundle[]) {
  return apexBundles.map(reflectSourceBody);
}

type ReferenceGuideReference = {
  typeName: string;
  directory: string;
  title: Link;
  description: RenderableContent[] | undefined;
};

type RenderableBundle = {
  // References are grouped by their defined @group annotation
  references: {
    [key: string]: ReferenceGuideReference[];
  };
  renderables: Renderable[];
};

function typesToRenderableBundle(config: DocumentationConfig, types: Type[]) {
  return types.reduce<RenderableBundle>(
    (acc, type) => {
      const renderable = typeToRenderable(
        type,
        (referenceName) => {
          return linkFromTypeNameGenerator(type, types, referenceName, config);
        },
        config.namespace,
      );
      acc.renderables.push(renderable);

      const descriptionLines = type.docComment?.descriptionLines;
      const reference = {
        typeName: type.name,
        directory: getDirectoryFromRoot(config, type),
        title: getLinkFromRoot(config, type),
        description: adaptDescribable(descriptionLines, (referenceName) =>
          getPossibleLinkFromRoot(config, referenceName, findType(types, referenceName)),
        ).description,
      };

      const group = getTypeGroup(type, config);
      if (!acc.references[group]) {
        acc.references[group] = [];
      }
      acc.references[group].push(reference);

      return acc;
    },
    {
      references: {},
      renderables: [],
    },
  );
}

function renderableToOutputDoc(referenceGuideReference: ReferenceGuideReference[], renderable: Renderable): DocOutput {
  function buildDocOutput(renderable: Renderable, docContents: string): DocOutput {
    const reference = referenceGuideReference.find(
      (ref) => ref.typeName.toLowerCase() === renderable.name.toLowerCase(),
    );
    return {
      directory: reference!.directory,
      docContents,
      typeName: renderable.name,
      type: renderable.type,
    };
  }

  return pipe(renderable, resolveApexTypeTemplate, compile, (docContents) => buildDocOutput(renderable, docContents));
}

function referencesToReferenceGuide(
  references: { [key: string]: ReferenceGuideReference[] },
  template: string,
): string {
  function alphabetizeReferences(references: { [key: string]: ReferenceGuideReference[] }): {
    [key: string]: ReferenceGuideReference[];
  } {
    return Object.keys(references)
      .sort((a, b) => a.localeCompare(b))
      .reduce<{ [key: string]: ReferenceGuideReference[] }>((acc, key) => {
        acc[key] = references[key].sort((a, b) => a.title.toString().localeCompare(b.title.toString()));
        return acc;
      }, {});
  }

  return pipe(references, alphabetizeReferences, (references) =>
    compile({
      template: template,
      source: references,
    }),
  );
}

function filterTypesOutOfScope(scope: string[], types: Type[]): Type[] {
  return new Manifest(types).filteredByAccessModifierAndAnnotations(scope);
}

function checkForReflectionErrors(reflectionResult: E.Either<ReflectionError, Type>[]) {
  function reduceReflectionResultIntoSingleEither(results: E.Either<ReflectionError, Type>[]): {
    errors: ReflectionError[];
    types: Type[];
  } {
    return results.reduce<{ errors: ReflectionError[]; types: Type[] }>(
      (acc, result) => {
        E.isLeft(result) ? acc.errors.push(result.left) : acc.types.push(result.right);
        return acc;
      },
      {
        errors: [],
        types: [],
      },
    );
  }

  return pipe(reflectionResult, reduceReflectionResultIntoSingleEither, ({ errors, types }) =>
    errors.length ? E.left(errors) : E.right(types),
  );
}

function addFileMetadataToTypeAnnotation(type: Type, metadata: string | null): Type {
  return pipe(
    O.fromNullable(metadata),
    O.map((metadata) => {
      const metadataParams = MetadataProcessor.process(metadata);
      metadataParams.forEach((value, key) => {
        const declaration = `${key}: ${value}`;
        type.annotations.push({
          rawDeclaration: declaration,
          name: declaration,
          type: declaration,
        });
      });
      return type;
    }),
    O.getOrElse(() => type),
  );
}

export class ReflectionError {
  constructor(
    public file: string,
    public message: string,
  ) {}
}

function reflectSourceBody(apexBundle: ApexBundle): E.Either<ReflectionError, Type> {
  const { filePath, rawTypeContent: input, rawMetadataContent: metadata } = apexBundle;
  const result = mirrorReflection(input);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return result.error
    ? E.left(new ReflectionError(filePath, result.error.message))
    : E.right(addFileMetadataToTypeAnnotation(result.typeMirror!, metadata));
}

function resolveApexTypeTemplate(renderable: Renderable): CompilationRequest {
  function getTemplate(renderable: Renderable): string {
    switch (renderable.type) {
      case 'enum':
        return enumMarkdownTemplate;
      case 'interface':
        return interfaceMarkdownTemplate;
      case 'class':
        return classMarkdownTemplate;
    }
  }

  return {
    template: getTemplate(renderable),
    source: renderable as RenderableEnum,
  };
}

function compile(request: CompilationRequest): string {
  return Template.getInstance().compile(request);
}

function findType(repository: Type[], referenceName: string) {
  return repository.find((currentType: Type) => currentType.name.toLowerCase() === referenceName.toLowerCase());
}

function addInheritedMembers<T extends Type>(repository: Type[], current: T): T {
  if (current.type_name === 'enum') {
    return current;
  } else if (current.type_name === 'interface') {
    return addInheritedInterfaceMethods(current as InterfaceMirror, repository) as T;
  } else {
    return addInheritedClassMembers(current as ClassMirror, repository) as T;
  }
}

function addInheritanceChain<T extends Type>(current: T, repository: Type[]): T {
  if (current.type_name === 'enum' || current.type_name === 'interface') {
    return current;
  } else {
    const inheritanceChain = createInheritanceChain(repository, current as ClassMirror);
    return {
      ...current,
      inheritanceChain,
    };
  }
}

function getParents<T extends Type>(
  extendedNamesExtractor: (current: T) => string[],
  current: T,
  repository: Type[],
): T[] {
  return pipe(
    extendedNamesExtractor(current),
    (interfaces: string[]) => interfaces.map((interfaceName) => repository.find((type) => type.name === interfaceName)),
    (interfaces = []) => interfaces.filter((type) => type !== undefined) as T[],
    (interfaces) =>
      interfaces.reduce<T[]>(
        (acc, current) => [...acc, ...getParents(extendedNamesExtractor, current, repository)],
        interfaces,
      ),
  );
}

function addInheritedInterfaceMethods(interfaceMirror: InterfaceMirror, repository: Type[]): InterfaceMirror {
  function methodAlreadyExists(memberName: string, members: { name: string }[]) {
    return members.some((member) => member.name.toLowerCase() === memberName.toLowerCase());
  }

  function parentExtractor(interfaceMirror: InterfaceMirror): string[] {
    return interfaceMirror.extended_interfaces;
  }

  const parents = getParents(parentExtractor, interfaceMirror, repository);
  return {
    ...interfaceMirror,
    methods: parents.reduce(
      (acc, currentValue) => [
        ...acc,
        ...currentValue.methods
          .filter((method) => !methodAlreadyExists(method.name, acc))
          .map((method) => ({
            ...method,
            inherited: true,
          })),
      ],
      interfaceMirror.methods,
    ),
  };
}

function addInheritedClassMembers(classMirror: ClassMirror, repository: Type[]): ClassMirror {
  function memberAlreadyExists(memberName: string, members: { name: string }[]) {
    return members.some((member) => member.name.toLowerCase() === memberName.toLowerCase());
  }

  function parentExtractor(classMirror: ClassMirror): string[] {
    return classMirror.extended_class ? [classMirror.extended_class] : [];
  }

  function filterMember<T extends { name: string; access_modifier: string }>(members: T[], existing: T[]): T[] {
    return members
      .filter((member) => member.access_modifier.toLowerCase() !== 'private')
      .filter((member) => !memberAlreadyExists(member.name, existing))
      .map((member) => ({
        ...member,
        inherited: true,
      }));
  }

  const parents = getParents(parentExtractor, classMirror, repository);
  return {
    ...classMirror,
    fields: parents.reduce(
      (acc, currentValue) => [...acc, ...filterMember(currentValue.fields, acc)],
      classMirror.fields,
    ),
    properties: parents.reduce(
      (acc, currentValue) => [...acc, ...filterMember(currentValue.properties, acc)],
      classMirror.properties,
    ),
    methods: parents.reduce(
      (acc, currentValue) => [...acc, ...filterMember(currentValue.methods, acc)],
      classMirror.methods,
    ),
  };
}

function linkFromTypeNameGenerator(
  typeBeingDocumented: Type,
  repository: Type[],
  referenceName: string,
  config: DocumentationConfig,
): StringOrLink {
  const type = findType(repository, referenceName);
  if (!type) {
    // If the type is not found, we return the type name as a string.
    return referenceName;
  }

  const [fullClassName, fileLink] = getFileLinkTuple(typeBeingDocumented, type, config);
  return {
    __type: 'link',
    title: fullClassName,
    url: fileLink,
  };
}

function getFileLinkTuple(
  typeBeingDocumented: Type,
  referencedType: Type,
  config: DocumentationConfig,
): [string, string] {
  const namespacePrefix = config.namespace ? `${config.namespace}.` : '';
  const directoryRoot = `${getDirectoryRoot(typeBeingDocumented, referencedType, config)}`;
  // TODO: Instead of adding a "." to the name when there is a namespace, maybe we want to create a folder for everything
  // within that namespace and put the files in there.
  const fullClassName = `${namespacePrefix}${referencedType.name}`;
  return [fullClassName, `${directoryRoot}${fullClassName}.md`];
}

function getDirectoryFromRoot(config: DocumentationConfig, type?: Type): string {
  if (!type) {
    return '';
  }
  return `./${getSanitizedGroup(type, config)}`;
}

function getPossibleLinkFromRoot(config: DocumentationConfig, fallback: string, type?: Type): StringOrLink {
  if (!type) {
    return fallback;
  }
  const namespacePrefix = config.namespace ? `${config.namespace}.` : '';
  const title = `${namespacePrefix}${type.name}`;
  return {
    __type: 'link',
    title: title,
    url: `${getDirectoryFromRoot(config, type)}/${title}.md`,
  };
}

function getLinkFromRoot(config: DocumentationConfig, type: Type): Link {
  const namespacePrefix = config.namespace ? `${config.namespace}.` : '';
  const title = `${namespacePrefix}${type.name}`;
  return {
    __type: 'link',
    title: title,
    url: `${getDirectoryFromRoot(config, type)}/${title}.md`,
  };
}

function getDirectoryRoot(typeBeingDocumented: Type, referencedType: Type, config: DocumentationConfig) {
  if (getTypeGroup(typeBeingDocumented, config) === getTypeGroup(referencedType, config)) {
    // If the types the same groups then we simply link directly to that file
    return './';
  } else {
    // If the types have different groups, then we have to go up a directory
    return `../${getSanitizedGroup(referencedType, config)}/`;
  }
}

function getTypeGroup(type: Type, config: DocumentationConfig): string {
  const groupAnnotation = type.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === 'group');
  return groupAnnotation?.body ?? config.defaultGroupName;
}

function getSanitizedGroup(classModel: Type, config: DocumentationConfig) {
  return getTypeGroup(classModel, config).replace(/ /g, '-').replace('.', '');
}
