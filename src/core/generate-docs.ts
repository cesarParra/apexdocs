import { reflect as mirrorReflection, Type } from '@cparra/apex-reflection';
import { typeToRenderableType } from '../adapters/apex-types';
import { Renderable, RenderableContent, RenderableEnum, StringOrLink } from './renderable/types';
import { classMarkdownTemplate } from '../transpiler/markdown/plain-markdown/class-template';
import { enumMarkdownTemplate } from '../transpiler/markdown/plain-markdown/enum-template';
import { interfaceMarkdownTemplate } from '../transpiler/markdown/plain-markdown/interface-template';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import { CompilationRequest, Template } from './template';
import Manifest from '../model/manifest';
import { referenceGuideTemplate } from './templates/reference-guide';
import { adaptDescribable } from '../adapters/documentables';

export const documentType = flow(typeToRenderableType, resolveApexTypeTemplate, compile);

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
  input: string[],
  config?: Partial<DocumentationConfig>,
): E.Either<string[], DocumentationBundle> {
  const configWithDefaults = { ...configDefaults, ...config };
  return pipe(
    input,
    (input) => input.map(reflectSourceBody),
    checkForReflectionErrors,
    E.map((types) => filterTypesOutOfScope(types, configWithDefaults.scope)),
    E.map((types) => typesToRenderableBundle(types, configWithDefaults)),
    E.map(({ references, renderables }) => ({
      referenceGuide: referencesToReferenceGuide(references, configWithDefaults.referenceGuideTemplate),
      docs: renderables.map(renderableToOutputDoc),
    })),
    E.map(({ referenceGuide, docs }) => ({ format: 'markdown', referenceGuide: referenceGuide, docs })),
  );
}

type ReferenceGuideReference = {
  title: StringOrLink;
  description: RenderableContent[] | undefined;
};

type RenderableBundle = {
  // References are grouped by their defined @group annotation
  references: {
    [key: string]: ReferenceGuideReference[];
  };
  renderables: Renderable[];
};

function typesToRenderableBundle(types: Type[], config: DocumentationConfig) {
  return types.reduce<RenderableBundle>(
    (acc, type) => {
      const renderable = typeToRenderableType(
        type,
        (referenceName) => {
          return linkFromTypeNameGenerator(type, types, referenceName, config);
        },
        config.namespace,
      );
      acc.renderables.push(renderable);

      const descriptionLines = type.docComment?.descriptionLines;
      const reference = {
        title: getLinkFromRoot(config, type),
        description: adaptDescribable(descriptionLines, (referenceName) => {
          const type = findType(types, referenceName);
          return type ? getLinkFromRoot(config, type) : referenceName;
        }).description,
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

function renderableToOutputDoc(renderable: Renderable): DocOutput {
  return pipe(renderable, resolveApexTypeTemplate, compile, (docContents) => buildDocOutput(renderable, docContents));
}

function referencesToReferenceGuide(
  references: { [key: string]: ReferenceGuideReference[] },
  template: string,
): string {
  return pipe(references, (references) =>
    compile({
      template: template,
      source: references,
    }),
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

function resolveApexTypeTemplate(renderable: Renderable): CompilationRequest {
  return {
    template: getTemplate(renderable),
    source: renderable as RenderableEnum,
  };
}

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

function compile(request: CompilationRequest): string {
  return Template.getInstance().compile(request);
}

function buildDocOutput(renderable: Renderable, docContents: string): DocOutput {
  return {
    docContents,
    typeName: renderable.name,
    type: renderable.type,
  };
}

function findType(repository: Type[], referenceName: string) {
  return repository.find((currentType: Type) => currentType.name.toLowerCase() === referenceName.toLowerCase());
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

function getLinkFromRoot(config: DocumentationConfig, type?: Type): StringOrLink {
  if (!type) {
    return '';
  }
  const namespacePrefix = config.namespace ? `${config.namespace}./` : '';
  return {
    title: `${namespacePrefix}${type.name}`,
    url: `./${namespacePrefix}${getSanitizedGroup(type, config)}/${type.name}.md`,
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
