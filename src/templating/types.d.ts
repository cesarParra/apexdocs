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

type DocumentableSource = {
  annotations?: Annotation[];
  description?: RenderableContent[];
  customTags?: CustomTag[];
  mermaid?: CodeBlock;
  example?: CodeBlock;
};

type BaseTypeSource = DocumentableSource & {
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

type ConstructorSource = DocumentableSource & {
  title: string;
  signature: string;
  parameters?: MethodParameterSource[];
  throws?: TypeSource[];
};

type MethodSource = DocumentableSource & {
  title: string;
  signature: string;
  parameters?: MethodParameterSource[];
  returnType?: TypeSource;
  throws?: TypeSource[];
  inherited?: boolean;
};

type FieldSource = DocumentableSource & {
  name: string;
  type: StringOrLink;
  accessModifier: string;
  inherited?: boolean;
  signature: string;
};

export type ClassSource = BaseTypeSource & {
  __type: 'class';
  extends?: StringOrLink;
  implements?: StringOrLink[];
  constructors?: ConstructorSource[];
  methods?: MethodSource[];
  classModifier?: string;
  sharingModifier?: string;
  fields?: FieldSource[];
  properties?: FieldSource[];
};

export type InterfaceSource = BaseTypeSource & {
  __type: 'interface';
  extends?: StringOrLink[];
  methods?: MethodSource[];
};

export type EnumSource = BaseTypeSource & {
  __type: 'enum';
  values: EnumValue[];
};
