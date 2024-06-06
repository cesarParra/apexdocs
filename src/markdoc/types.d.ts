type SourceType = 'enum' | 'class' | 'interface';

type LinkNode = {
  type: 'link';
  url: string;
  title: string;
};

type DescriptionNode = string | LinkNode;

export type SourceFile = {
  name: string;
  sourceType: SourceType;
  descriptionNodes?: DescriptionNode[];
  group?: string;
  url: string;
};

export type Manifest = {
  files: SourceFile[];
};
