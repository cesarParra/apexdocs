export type Link = {
  title: string;
  url: string;
};

export type EmptyLine = {
  type: 'empty-line';
};

export type RenderableContent = string | Link | EmptyLine;

export type ConvertRenderableContentsToString = (content?: RenderableContent[]) => string;

type EnumValue = {
  value: string;
  description?: RenderableContent[];
};

type CustomTag = {
  name: string;
  value: string;
};

/**
 * Represents an annotation to a top-level type. For example @NamespaceAccessible.
 */
type Annotation = string;

type BaseTypeSource = {
  name: string;
  accessModifier: string;
  description?: RenderableContent[];
  group?: string;
  author?: string;
  date?: string;
  customTags?: CustomTag[];
  sees?: Link[];
};

type MethodSource = {
  declaration: string;
  description?: RenderableContent[];
  annotations?: Annotation[];
};

export type InterfaceSource = BaseTypeSource & {
  __type: 'interface';
  annotations?: Annotation[];
  extends?: Link[];
  mermaid?: string[];
  methods?: MethodSource[];
};

export type EnumSource = BaseTypeSource & {
  __type: 'enum';
  values: EnumValue[];
};
