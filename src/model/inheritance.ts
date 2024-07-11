import { ClassMirror, FieldMirror, MethodMirror, PropertyMirror } from '@cparra/apex-reflection';

export type InheritanceSupport = { inherited: boolean };
export type ClassMirrorWithInheritanceChain = ClassMirror & { inheritanceChain: string[] };
export type FieldMirrorWithInheritance = FieldMirror & InheritanceSupport;
export type PropertyMirrorWithInheritance = PropertyMirror & InheritanceSupport;
export type MethodMirrorWithInheritance = MethodMirror & InheritanceSupport;
export type FieldOrProperty = FieldMirrorWithInheritance | PropertyMirrorWithInheritance;
