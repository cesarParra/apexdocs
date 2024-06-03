export type SourceFile = {
  name: string;
  description?: string;
  group?: string;
  url: string;
};

export type Manifest = {
  files: SourceFile[];
};
