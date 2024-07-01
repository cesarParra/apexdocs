export type Link = {
  title: string;
  url: string;
};

export type EmptyLine = {
  type: 'empty-line';
};

export type StringOrLink = string | Link;

export type RenderableContent = StringOrLink | EmptyLine;

export type ConvertRenderableContentsToString = (content?: RenderableContent[]) => string;

type EnumValue = {
  value: string;
  description?: RenderableContent[];
};

type CustomTag = {
  name: string;
  description?: RenderableContent[];
};

/**
 * Represents an annotation to a top-level type. For example @NamespaceAccessible.
 */
type Annotation = string;

type CodeBlock = string[];

type RenderableDocumentation = {
  annotations?: Annotation[];
  description?: RenderableContent[];
  customTags?: CustomTag[];
  mermaid: RenderableSection<CodeBlock | undefined>;
  example: RenderableSection<CodeBlock | undefined>;
  group?: string;
  author?: string;
  date?: string;
  sees?: StringOrLink[];
};

type RenderableType = {
  headingLevel: number;
  heading: string;
  name: string;
  meta: {
    accessModifier: string;
  };
  doc: RenderableDocumentation;
};

type RenderableMethodParameter = {
  name: string;
  type: StringOrLink;
  description?: RenderableContent[];
};

type TypeSource = {
  type: StringOrLink;
  description?: RenderableContent[];
};

type RenderableConstructor = {
  headingLevel: number;
  heading: string;
  signature: RenderableSection<CodeBlock>;
  parameters?: RenderableSection<RenderableMethodParameter[] | undefined>;
  throws?: RenderableSection<TypeSource[] | undefined>;
  doc: RenderableDocumentation;
};

type RenderableMethod = {
  doc: RenderableDocumentation;
  headingLevel: number;
  heading: string;
  signature: RenderableSection<CodeBlock>;
  parameters: RenderableSection<RenderableMethodParameter[] | undefined>;
  returnType: RenderableSection<TypeSource>;
  throws: RenderableSection<TypeSource[] | undefined>;
  inherited?: boolean;
};

type RenderableField = {
  headingLevel: number;
  heading: string;
  type: RenderableSection<StringOrLink>;
  accessModifier: string;
  inherited?: boolean;
  signature: RenderableSection<CodeBlock>;
  doc: RenderableDocumentation;
};

type RenderableSection<T> = {
  headingLevel: number;
  heading: string;
  value: T;
};

export type RenderableClass = RenderableType & {
  __type: 'class';
  extends?: StringOrLink;
  implements?: StringOrLink[];
  classModifier?: string;
  sharingModifier?: string;
  constructors: RenderableSection<RenderableConstructor[]>;
  methods: RenderableSection<RenderableMethod[]>;
  fields: RenderableSection<RenderableField[]>;
  properties: RenderableSection<RenderableField[]>;
  innerClasses: RenderableSection<RenderableClass[]>;
  innerEnums: RenderableSection<RenderableEnum[]>;
  innerInterfaces: RenderableSection<RenderableInterface[]>;
};

export type RenderableInterface = RenderableType & {
  __type: 'interface';
  extends?: StringOrLink[];
  methods: RenderableSection<RenderableMethod[]>;
};

export type RenderableEnum = RenderableType & {
  __type: 'enum';
  values: RenderableSection<EnumValue[]>;
};
