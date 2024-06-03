export type ApexType = {
  name: string;
  url: string;
  description?: string;
};

export type SourceManifest = {
  [key: string]: ApexType[];
};
