export type Link = {
  title: string;
  url: string;
};

type DescriptionContent = string | Link;

export type EnumSource = {
  name: string;
  description?: DescriptionContent[];
};
