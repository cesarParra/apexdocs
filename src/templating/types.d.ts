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

export type InterfaceSource = {
  __type: 'interface';
  name: string;
  accessModifier: string;
  annotations?: Annotation[];
};

export type EnumSource = {
  __type: 'enum';
  name: string;
  accessModifier: string;
  values: EnumValue[];
  description?: RenderableContent[];
  group?: string;
  author?: string;
  date?: string;
  customTags?: CustomTag[];
  sees?: Link[];
};
