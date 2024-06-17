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
  value: RenderableContent[];
};

/**
 * Represents an annotation to a top-level type. For example @NamespaceAccessible.
 */
type Annotation = string;

type CodeBlock = string[];

type BaseDocAwareSource = {
  description?: RenderableContent[];
  customTags?: CustomTag[];
  mermaid?: CodeBlock;
  example?: CodeBlock;
};

type BaseTypeSource = BaseDocAwareSource & {
  name: string;
  accessModifier: string;
  group?: string;
  author?: string;
  date?: string;
  sees?: StringOrLink[];
};

type MethodParameterSource = {
  name: string;
  type: StringOrLink;
  description?: RenderableContent[];
};

type TypeSource = {
  type: StringOrLink;
  description?: RenderableContent[];
};

type MethodSource = BaseDocAwareSource & {
  declaration: string;
  annotations?: Annotation[];
  parameters?: MethodParameterSource[];
  returnType?: TypeSource;
  throws?: TypeSource[];
  inherited?: boolean;
};

export type InterfaceSource = BaseTypeSource & {
  __type: 'interface';
  annotations?: Annotation[];
  extends?: StringOrLink[];
  methods?: MethodSource[];
};

export type EnumSource = BaseTypeSource & {
  __type: 'enum';
  values: EnumValue[];
};
