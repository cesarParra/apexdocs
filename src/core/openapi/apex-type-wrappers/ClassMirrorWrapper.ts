import { ClassMirror, MethodMirror } from '@cparra/apex-reflection';

export class ClassMirrorWrapper {
  constructor(public classMirror: ClassMirror) {}

  getMethodsByAnnotation(annotation: string): MethodMirror[] {
    return this.classMirror.methods.filter((method) => this.hasAnnotation(method, annotation));
  }

  private hasAnnotation = (method: MethodMirror, annotationName: string) =>
    method.annotations.some((annotation) => annotation.name.toLowerCase() === annotationName);
}
