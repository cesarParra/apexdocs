import { DocCommentAnnotation, MethodMirror } from '@cparra/apex-reflection';
import * as yaml from 'js-yaml';

export class MethodMirrorWrapper {
  constructor(public methodMirror: MethodMirror) {}

  public hasDocCommentAnnotation = (annotationName: string) =>
    this.methodMirror.docComment?.annotations.some((annotation) => annotation.name.toLowerCase() === annotationName);

  public getDocCommentAnnotation = (annotationName: string): DocCommentAnnotation | undefined =>
    this.methodMirror.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === annotationName);

  /** The body of these annotations is expected to be in YAML format. */
  public getDocCommentAnnotationsAs = <T>(annotationName: string): T[] =>
    (this.methodMirror.docComment?.annotations ?? [])
      .filter((annotation) => annotation.name.toLowerCase() === annotationName)
      .map((annotation) => yaml.load(annotation.bodyLines.join('\n')) as T | undefined)
      .filter((parsed): parsed is T => parsed !== undefined);
}
