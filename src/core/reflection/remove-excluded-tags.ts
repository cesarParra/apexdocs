import * as O from 'fp-ts/Option';
import { match } from 'fp-ts/boolean';
import { ClassMirror, DocComment, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import { apply } from '#utils/fp';
import { ParsedFile } from '../shared/types';

type AppliedRemoveTagFn = (tagName: string, removeFn: RemoveTagFn) => DocComment;
type RemoveTagFn = (docComment: DocComment) => DocComment;
type Documentable = { docComment?: DocComment };

export const removeExcludedTags = (excludedTags: string[], parsedFiles: ParsedFile[]): ParsedFile[] => {
  return parsedFiles.map((parsedFile) => {
    return {
      ...parsedFile,
      type: removeExcludedTagsFromType(excludedTags, parsedFile.type),
    };
  });
};

const removeExcludedTagsFromType = <T extends Type>(excludedTags: string[], type: T): T => {
  return {
    ...handleType(excludedTags, type),
    docComment: removeExcludedTagsFromDocComment(excludedTags, type.docComment),
  } as T;
};

const handleType = (excludedTags: string[], type: Type): Type => {
  switch (type.type_name) {
    case 'class':
      return handleClass(excludedTags, type as ClassMirror);
    case 'interface':
      return handleInterface(excludedTags, type as InterfaceMirror);
    case 'enum':
      return type;
  }
};

const handleClass = (excludedTags: string[], classMirror: ClassMirror): ClassMirror => {
  return {
    ...classMirror,
    methods: classMirror.methods.map((method) => removeExcludedTagsFromDocumentable(excludedTags, method)),
    properties: classMirror.properties.map((property) => removeExcludedTagsFromDocumentable(excludedTags, property)),
    fields: classMirror.fields.map((field) => removeExcludedTagsFromDocumentable(excludedTags, field)),
    constructors: classMirror.constructors.map((constructor) =>
      removeExcludedTagsFromDocumentable(excludedTags, constructor),
    ),
    enums: classMirror.enums.map((enumType) => removeExcludedTagsFromType(excludedTags, enumType)),
    interfaces: classMirror.interfaces.map((interfaceType) => removeExcludedTagsFromType(excludedTags, interfaceType)),
    classes: classMirror.classes.map((innerClass) => removeExcludedTagsFromType(excludedTags, innerClass)),
  };
};

const handleInterface = (excludedTags: string[], interfaceMirror: InterfaceMirror): InterfaceMirror => {
  return {
    ...interfaceMirror,
    methods: interfaceMirror.methods.map((method) => removeExcludedTagsFromDocumentable(excludedTags, method)),
  };
};

const removeExcludedTagsFromDocumentable = <T extends Documentable>(excludedTags: string[], documentable: T): T => {
  return {
    ...documentable,
    docComment: removeExcludedTagsFromDocComment(excludedTags, documentable.docComment),
  };
};

const removeExcludedTagsFromDocComment = (
  excludedTags: string[],
  docComment: DocComment | undefined,
): DocComment | undefined => {
  const removerFn = apply(remove, excludedTags);

  return pipe(
    O.fromNullable(docComment),
    O.map((docComment) => removeExcludedTagsFromAnnotations(excludedTags, docComment)),
    O.map((docComment) => removeExampleTag(apply(removerFn, docComment))),
    O.map((docComment) => removeParamTags(apply(removerFn, docComment))),
    O.map((docComment) => removeReturnTag(apply(removerFn, docComment))),
    O.map((docComment) => removeThrowsTag(apply(removerFn, docComment))),
    O.map((docComment) => removeExceptionTag(apply(removerFn, docComment))),
    O.map((docComment) => removeDescription(apply(removerFn, docComment))),
    O.fold(
      () => undefined,
      (updatedDocComment) => updatedDocComment,
    ),
  );
};

const removeExcludedTagsFromAnnotations = (excludedTags: string[], docComment: DocComment): DocComment => {
  return pipe(
    O.some(docComment.annotations),
    O.map((annotations) => annotations.filter((annotation) => !includesIgnoreCase(excludedTags, annotation.name))),
    O.fold(
      () => docComment,
      (filteredAnnotations) => ({
        ...docComment,
        annotations: filteredAnnotations,
      }),
    ),
  );
};

const removeExampleTag = (remover: AppliedRemoveTagFn): DocComment => {
  return remover('example', (docComment) => {
    return {
      ...docComment,
      exampleAnnotation: null,
    };
  });
};

const removeParamTags = (remover: AppliedRemoveTagFn): DocComment => {
  return remover('param', (docComment) => {
    return {
      ...docComment,
      paramAnnotations: [],
    };
  });
};

const removeReturnTag = (remover: AppliedRemoveTagFn): DocComment => {
  return remover('return', (docComment) => {
    return {
      ...docComment,
      returnAnnotation: null,
    };
  });
};

const removeThrowsTag = (remover: AppliedRemoveTagFn): DocComment => {
  return remover('throws', (docComment) => {
    return {
      ...docComment,
      throwsAnnotations: [],
    };
  });
};

const removeExceptionTag = (remover: AppliedRemoveTagFn): DocComment => {
  return remover('exception', (docComment) => {
    return {
      ...docComment,
      throwsAnnotations: [],
    };
  });
};

const removeDescription = (remover: AppliedRemoveTagFn): DocComment => {
  return remover('description', (docComment) => {
    return {
      ...docComment,
      description: '',
      descriptionLines: [],
    };
  });
};

const remove = (excludedTags: string[], docComment: DocComment, tagName: string, removeFn: RemoveTagFn): DocComment => {
  return match(
    () => docComment,
    () => removeFn(docComment!),
  )(includesIgnoreCase(excludedTags, tagName) && !!docComment);
};

const includesIgnoreCase = (excluded: string[], value: string): boolean => {
  return excluded.some((element) => element.toLowerCase() === value.toLowerCase());
};
