export type Link = {
  title: string;
  url: string;
};

export type RenderableContent = string | Link;

export type ConvertRenderableContentsToString = (content?: RenderableContent[]) => string;

type EnumValue = {
  value: string;
  description?: RenderableContent[];
};

type CustomTag = {
  name: string;
  value: string;
};

export type EnumSource = {
  name: string;
  values: EnumValue[];
  description?: RenderableContent[];
  group?: string;
  author?: string;
  date?: string;
  customTags?: CustomTag[];
  sees?: Link[];
};
