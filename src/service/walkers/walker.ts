import {
  ClassMirror,
  ConstructorMirror,
  EnumMirror,
  FieldMirror,
  InterfaceMirror,
  MethodMirror,
  PropertyMirror,
  Type,
} from '@cparra/apex-reflection';

export interface WalkerListener {
  onTypeDeclaration(typeMirror: Type): void;

  onConstructorDeclaration(className: string, constructors: ConstructorMirror[]): void;

  onFieldsDeclaration(fields: FieldMirror[]): void;

  onPropertiesDeclaration(properties: PropertyMirror[]): void;

  onMethodsDeclaration(methods: MethodMirror[]): void;

  onInnerEnumsDeclaration(enums: EnumMirror[]): void;

  onInnerClassesDeclaration(classes: ClassMirror[]): void;

  onInnerInterfacesDeclaration(interfaces: InterfaceMirror[]): void;
}

export abstract class Walker {
  constructor(public type: Type) {}

  abstract walk(listener: WalkerListener): void;
}
