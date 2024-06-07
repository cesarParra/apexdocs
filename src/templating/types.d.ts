export type Link = {
  title: string;
  url: string;
};

export type RenderableContent = string | Link;

type EnumValue = {
  value: string;
  description?: RenderableContent[];
};

export type EnumSource = {
  name: string;
  values: EnumValue[];
  description?: RenderableContent[];
  sees?: Link[];
};
