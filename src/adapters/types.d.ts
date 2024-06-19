import { Annotation, DocComment } from '@cparra/apex-reflection';

export type Describable = string[] | undefined;

export type Documentable = {
  annotations: Annotation[];
  docComment?: DocComment;
};
