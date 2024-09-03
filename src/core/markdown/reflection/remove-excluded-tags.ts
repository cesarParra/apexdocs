import * as O from 'fp-ts/Option';
import { ParsedFile } from '../../shared/types';
import { DocComment, DocCommentAnnotation } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';

export const removeExcludedTags = (excludedTags: string[], parsedFiles: ParsedFile[]): ParsedFile[] => {
  return parsedFiles.map((parsedFile) => {
    return {
      ...parsedFile,
      type: {
        ...parsedFile.type,
        docComment: removeExcludedTagsFromType(excludedTags, parsedFile.type.docComment),
      },
    };
  });
};

const removeExcludedTagsFromType = (
  excludedTags: string[],
  docComment: DocComment | undefined,
): DocComment | undefined => {
  const filteredAnnotations: O.Option<DocCommentAnnotation[]> = pipe(
    O.fromNullable(docComment?.annotations),
    O.map((annotations) => annotations.filter((annotation) => !excludedTags.includes(annotation.name))),
  );

  return O.fold(
    () => undefined,
    (updatedDocComment: DocCommentAnnotation[]) =>
      ({
        ...docComment,
        annotations: updatedDocComment,
      }) as DocComment,
  )(filteredAnnotations);
};
