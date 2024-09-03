import * as O from 'fp-ts/Option';
import { ParsedFile } from '../../shared/types';
import { DocComment } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';

export const removeExcludedTags = (excludedTags: string[], parsedFiles: ParsedFile[]): ParsedFile[] => {
  return parsedFiles.map((parsedFile) => {
    return {
      ...parsedFile,
      type: {
        ...parsedFile.type,
        docComment: removeExcludedTagsFromDocComment(excludedTags, parsedFile.type.docComment),
      },
    };
  });
};

const removeExcludedTagsFromDocComment = (
  excludedTags: string[],
  docComment: DocComment | undefined,
): DocComment | undefined => {
  return pipe(
    O.fromNullable(docComment),
    O.map((docComment) => removeExcludedTagsFromAnnotations(excludedTags, docComment)),
    O.map((docComment) => removeExampleTag(excludedTags, docComment)),
    O.map((docComment) => removeParamTags(excludedTags, docComment)),
    O.fold(
      () => undefined,
      (updatedDocComment) => updatedDocComment,
    ),
  );
};

const removeExcludedTagsFromAnnotations = (
  excludedTags: string[],
  docComment: DocComment | undefined,
): DocComment | undefined => {
  return pipe(
    O.fromNullable(docComment?.annotations),
    O.map((annotations) => annotations.filter((annotation) => !includesIgnoreCase(excludedTags, annotation.name))),
    O.fold(
      () => undefined,
      (updatedDocComment) =>
        ({
          ...docComment,
          annotations: updatedDocComment,
        }) as DocComment,
    ),
  );
};

const removeExampleTag = (excludedTags: string[], docComment: DocComment | undefined): DocComment | undefined => {
  if (!includesIgnoreCase(excludedTags, 'example')) {
    return docComment;
  }

  return {
    ...docComment,
    exampleAnnotation: null,
  } as DocComment;
};

const removeParamTags = (excludedTags: string[], docComment: DocComment | undefined): DocComment | undefined => {
  if (!includesIgnoreCase(excludedTags, 'param')) {
    return docComment;
  }

  return {
    ...docComment,
    paramAnnotations: [],
  } as DocComment;
};

const includesIgnoreCase = (array: string[], value: string): boolean => {
  return array.some((element) => element.toLowerCase() === value.toLowerCase());
};
