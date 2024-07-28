import { DocCommentAnnotation, MethodMirror } from '@cparra/apex-reflection';

export class MethodMirrorWrapper {
  constructor(public methodMirror: MethodMirror) {}

  public hasDocCommentAnnotation = (annotationName: string) =>
    this.methodMirror.docComment?.annotations.some((annotation) => annotation.name.toLowerCase() === annotationName);

  public getDocCommentAnnotation = (annotationName: string): DocCommentAnnotation | undefined =>
    this.methodMirror.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === annotationName);
}
