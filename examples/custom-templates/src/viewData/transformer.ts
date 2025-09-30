/**
 * This file is responsible for transforming data to a format appropriate for templates. This would
 * export decorated, or transformed types to be used in the by the engine.
 */

import {
  ClassMirror,
  EnumMirror,
  FieldMirror,
  InterfaceMirror,
  MethodMirror,
  PropertyMirror,
  Type,
} from '@cparra/apex-reflection';

/**
 * Define decorated types
 */
type MirrorExtras = {
  MethodMirror: { signature: string };
  PropertyMirror: { fullName: string };
  FieldMirror: { fullName: string };
};

// Generic decorator type: adds extras if available
export type Decorate<T> = T extends MethodMirror
  ? T & MirrorExtras['MethodMirror']
  : T extends PropertyMirror
    ? T & MirrorExtras['PropertyMirror']
    : T extends FieldMirror
      ? T & MirrorExtras['FieldMirror']
      : T;

// ----------------------
// Describe how decorators are applied
// ----------------------
function decorateMethod(m: MethodMirror): Decorate<MethodMirror> {
  return {
    ...m,
    signature: `${m.name}(${m.parameters.map((p) => p.typeReference.type).join(', ')})`,
  };
}

function decorateProperty(p: PropertyMirror): Decorate<PropertyMirror> {
  return {
    ...p,
    fullName: `${p.access_modifier} ${p.typeReference.type} ${p.name}`,
  };
}

function decorateField(f: FieldMirror): Decorate<FieldMirror> {
  return {
    ...f,
    fullName: `${f.access_modifier} ${f.typeReference.type} ${f.name}`,
  };
}

// ----------------------
// Higher-level walkers
// ----------------------
function decorateClass(c: ClassMirror): ClassMirror {
  return {
    ...c,
    methods: c.methods.map(decorateMethod),
    properties: c.properties.map(decorateProperty),
    fields: c.fields.map(decorateField),
    enums: c.enums.map(decorateEnum),
    interfaces: c.interfaces.map(decorateInterface),
    classes: c.classes.map(decorateClass),
  };
}

function decorateInterface(i: InterfaceMirror): InterfaceMirror {
  return {
    ...i,
    methods: i.methods.map(decorateMethod),
  };
}

function decorateEnum(e: EnumMirror): EnumMirror {
  return {
    ...e,
    values: e.values.map((v) => ({ ...v })),
  };
}

// ----------------------
// Generic entry point
// ----------------------
export function decorateType(t: Type): Type {
  switch (t.type_name) {
    case 'class':
      return decorateClass(t as ClassMirror);
    case 'interface':
      return decorateInterface(t as InterfaceMirror);
    case 'enum':
      return decorateEnum(t as EnumMirror);
    default:
      return t;
  }
}
