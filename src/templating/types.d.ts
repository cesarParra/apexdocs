export type Link = {
  title: string;
  url: string;
};

export type DescriptionContent = string | Link;

type EnumValue = {
  value: string;
  description?: DescriptionContent[];
};

export type EnumSource = {
  name: string;
  values: EnumValue[];
  description?: DescriptionContent[];
};
