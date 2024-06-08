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

export type InterfaceSource = {
  __type: 'interface';
  name: string;
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
