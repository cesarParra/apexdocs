import { DocComment, reflect as mirrorReflection, Type } from '@cparra/apex-reflection';
import { typeToRenderableType } from '../adapters/apex-types';
import { Renderable, RenderableEnum, StringOrLink } from '../templating/types';
import { classMarkdownTemplate } from '../transpiler/markdown/plain-markdown/class-template';
import { enumMarkdownTemplate } from '../transpiler/markdown/plain-markdown/enum-template';
import { interfaceMarkdownTemplate } from '../transpiler/markdown/plain-markdown/interface-template';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { flow, pipe } from 'fp-ts/function';
import { CompilationRequest, Template } from './template';
import Manifest from '../model/manifest';

export const documentType = flow(typeToRenderableType, resolveTemplate, compile);

export type DocumentationBundle = {
  format: 'markdown';
  docs: DocOutput[];
};

type DocumentationConfig = {
  scope: string[];
  outputDir: string;
  namespace?: string;
  sortMembersAlphabetically?: boolean;
  defaultGroupName: string;
};

type DocOutput = {
  docContents: string;
  typeName: string;
  type: 'class' | 'interface' | 'enum';
  group: O.Option<string>;
};

const configDefaults: DocumentationConfig = {
  scope: ['public'],
  outputDir: 'docs',
  defaultGroupName: 'Miscellaneous',
};

export function generateDocs(
  input: string[],
  config?: Partial<DocumentationConfig>,
): E.Either<string[], DocumentationBundle> {
  const configWithDefaults = { ...configDefaults, ...config };
  return pipe(
    input,
    (input) => input.map(reflectSourceBody),
    checkForReflectionErrors,
    E.map((types) => filterTypesOutOfScope(types, configWithDefaults.scope)),
    E.map((types) => types.map((type) => typeToDocOutput(types, type, configWithDefaults))),
    E.map((docs) => ({ format: 'markdown', docs })),
  );
}

function typeToDocOutput(repository: Type[], type: Type, config: DocumentationConfig): DocOutput {
  return pipe(
    typeToRenderableType(
      type,
      (referenceName) => {
        return linkFromTypeNameGenerator(type, repository, referenceName, config);
      },
      config.namespace,
    ),
    resolveTemplate,
    compile,
    (docContents) => buildDocOutput(type, docContents),
  );
}

function filterTypesOutOfScope(types: Type[], scope: string[]): Type[] {
  return new Manifest(types).filteredByAccessModifierAndAnnotations(scope);
}

function checkForReflectionErrors(reflectionResult: E.Either<string, Type>[]) {
  return pipe(reflectionResult, reduceReflectionResultIntoSingleEither, ({ errors, types }) =>
    errors.length ? E.left(errors) : E.right(types),
  );
}

function reduceReflectionResultIntoSingleEither(results: E.Either<string, Type>[]): {
  errors: string[];
  types: Type[];
} {
  return results.reduce<{ errors: string[]; types: Type[] }>(
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

function reflectSourceBody(input: string): E.Either<string, Type> {
  const result = mirrorReflection(input);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return result.error ? E.left(result.error.message) : E.right(result.typeMirror!);
}

function resolveTemplate(renderable: Renderable): CompilationRequest {
  return {
    template: getTemplate(renderable),
    source: renderable as RenderableEnum,
  };
}

function getTemplate(renderable: Renderable): string {
  switch (renderable.__type) {
    case 'enum':
      return enumMarkdownTemplate;
    case 'interface':
      return interfaceMarkdownTemplate;
    case 'class':
      return classMarkdownTemplate;
  }
}

function compile(request: CompilationRequest): string {
  return Template.getInstance().compile(request);
}

function buildDocOutput(type: Type, docContents: string): DocOutput {
  return {
    docContents,
    typeName: type.name,
    type: type.type_name,
    group: O.fromNullable(extractDocCommentGroup(type.docComment)),
  };
}

function extractDocCommentGroup(document?: DocComment): string | undefined {
  return document?.annotations.find((a) => a.name === 'group')?.body;
}

function linkFromTypeNameGenerator(
  typeBeingDocumented: Type,
  repository: Type[],
  referenceName: string,
  config: DocumentationConfig,
): StringOrLink {
  const type = repository.find((currentType: Type) => currentType.name.toLowerCase() === referenceName.toLowerCase());
  if (!type) {
    // If the type is not found, we return the type name as a string.
    return referenceName;
  }

  const [fullClassName, fileLink] = getFileLinkTuple(typeBeingDocumented, type, config);
  return {
    title: fullClassName,
    url: fileLink,
  };
}

function getFileLinkTuple(
  typeBeingDocumented: Type,
  referencedType: Type,
  config: DocumentationConfig,
): [string, string] {
  function namespacePrefix() {
    return config.namespace ? `${config.namespace}.` : '';
  }

  const directoryRoot = `${getDirectoryRoot(typeBeingDocumented, referencedType, config)}`;
  // TODO: Instead of adding a "." to the name when there is a namespace, maybe we want to create a folder for everything
  // within that namespace and put the files in there.
  const fullClassName = `${namespacePrefix()}${referencedType.name}`;
  return [fullClassName, `${directoryRoot}${fullClassName}.md`];
}

function getDirectoryRoot(typeBeingDocumented: Type, referencedType: Type, config: DocumentationConfig) {
  if (getClassGroup(typeBeingDocumented, config) === getClassGroup(referencedType, config)) {
    // If the types the same groups then we simply link directly to that file
    return './';
  } else {
    // If the types have different groups, then we have to go up a directory
    return `../${getSanitizedGroup(referencedType, config)}/`;
  }
}

function getClassGroup(classModel: Type, config: DocumentationConfig): string {
  const groupAnnotation = classModel.docComment?.annotations.find(
    (annotation) => annotation.name.toLowerCase() === 'group',
  );
  return groupAnnotation?.body ?? config.defaultGroupName;
}

function getSanitizedGroup(classModel: Type, config: DocumentationConfig) {
  return getClassGroup(classModel, config).replace(/ /g, '-').replace('.', '');
}
