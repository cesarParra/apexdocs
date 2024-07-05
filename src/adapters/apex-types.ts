import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import {
  RenderableType,
  RenderableClass,
  RenderableEnum,
  RenderableInterface,
  Renderable,
  RenderableSection,
  GroupedMember,
} from '../core/renderable/types';
import { adaptDescribable, adaptDocumentable } from './documentables';
import { GetRenderableContentByTypeName, linkFromTypeNameGenerator } from './references';
import { FieldMirrorWithInheritance, PropertyMirrorWithInheritance } from '../model/inheritance';
import { adaptConstructor, adaptMethod } from './methods-and-constructors';
import { adaptFieldOrProperty } from './fields-and-properties';

function baseTypeAdapter(
  type: EnumMirror | InterfaceMirror | ClassMirror,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
): RenderableType {
  function getHeading(type: Type): string {
    const suffixMap = {
      class: 'Class',
      interface: 'Interface',
      enum: 'Enum',
    };

    return `${type.name} ${suffixMap[type.type_name]}`;
  }

  return {
    headingLevel: baseHeadingLevel,
    heading: getHeading(type),
    doc: adaptDocumentable(type, linkGenerator, baseHeadingLevel + 1),
    name: type.name,
    meta: {
      accessModifier: type.access_modifier,
    },
  };
}

export function typeToRenderableType(
  type: Type,
  linkGenerator: GetRenderableContentByTypeName,
  namespace?: string,
): Renderable {
  function getRenderable() {
    switch (type.type_name) {
      case 'enum':
        return enumTypeToEnumSource(type as EnumMirror, linkGenerator);
      case 'interface':
        return interfaceTypeToInterfaceSource(type as InterfaceMirror, linkGenerator);
      case 'class':
        return classTypeToClassSource(type as ClassMirror, linkGenerator);
    }
  }

  return {
    ...getRenderable(),
    namespace,
  };
}

export function enumTypeToEnumSource(
  enumType: EnumMirror,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number = 1,
): RenderableEnum {
  return {
    type: 'enum',
    ...baseTypeAdapter(enumType, linkGenerator, baseHeadingLevel),
    values: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Values',
      value: enumType.values.map((value) => ({
        ...adaptDescribable(value.docComment?.descriptionLines, linkGenerator),
        value: value.name,
      })),
    },
  };
}

export function interfaceTypeToInterfaceSource(
  interfaceType: InterfaceMirror,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number = 1,
): RenderableInterface {
  return {
    type: 'interface',
    ...baseTypeAdapter(interfaceType, linkGenerator, baseHeadingLevel),
    extends: interfaceType.extended_interfaces.map(linkFromTypeNameGenerator),
    methods: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Methods',
      value: interfaceType.methods.map((method) => adaptMethod(method, linkGenerator, baseHeadingLevel + 2)),
    },
  };
}

export function classTypeToClassSource(
  classType: ClassMirror,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number = 1,
): RenderableClass {
  return {
    type: 'class',
    ...baseTypeAdapter(classType, linkGenerator, baseHeadingLevel),
    classModifier: classType.classModifier,
    sharingModifier: classType.sharingModifier,
    implements: classType.implemented_interfaces.map(linkFromTypeNameGenerator),
    extends: classType.extended_class ? linkFromTypeNameGenerator(classType.extended_class) : undefined,
    methods: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Methods',
      value: classType.methods.map((method) => adaptMethod(method, linkGenerator, baseHeadingLevel + 2)),
    },
    constructors: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Constructors',
      value: classType.constructors.map((constructor) =>
        adaptConstructor(classType.name, constructor, linkGenerator, baseHeadingLevel + 2),
      ),
    },
    fields: adaptMembers(
      'Fields',
      classType.fields as FieldMirrorWithInheritance[],
      adaptFieldOrProperty,
      linkFromTypeNameGenerator,
      baseHeadingLevel + 1,
    ),
    properties: adaptMembers(
      'Properties',
      classType.properties as PropertyMirrorWithInheritance[],
      adaptFieldOrProperty,
      linkFromTypeNameGenerator,
      baseHeadingLevel + 1,
    ),
    innerClasses: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Classes',
      value: classType.classes.map((innerClass) =>
        classTypeToClassSource(innerClass, linkGenerator, baseHeadingLevel + 2),
      ),
    },
    innerEnums: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Enums',
      value: classType.enums.map((innerEnum) => enumTypeToEnumSource(innerEnum, linkGenerator, baseHeadingLevel + 2)),
    },
    innerInterfaces: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Interfaces',
      value: classType.interfaces.map((innerInterface) =>
        interfaceTypeToInterfaceSource(innerInterface, linkGenerator, baseHeadingLevel + 2),
      ),
    },
  };
}

type Groupable = { group?: string; groupDescription?: string };

function adaptMembers<T extends Groupable, K>(
  heading: string,
  fields: T[],
  adapter: (member: T, linkGenerator: GetRenderableContentByTypeName, baseHeadingLevel: number) => K,
  linkFromTypeNameGenerator: GetRenderableContentByTypeName,
  headingLevel: number,
): RenderableSection<K[] | GroupedMember<K>[]> & { isGrouped: boolean } {
  return {
    headingLevel,
    heading,
    isGrouped: hasGroup(fields),
    value: hasGroup(fields)
      ? toGroupedFields(fields, adapter, linkFromTypeNameGenerator, headingLevel + 1)
      : toFlat(fields, adapter, linkFromTypeNameGenerator, headingLevel + 1),
  };
}

function hasGroup(members: Groupable[]): boolean {
  return members.some((member) => member.group);
}

function toFlat<T extends Groupable, K>(
  members: T[],
  adapter: (member: T, linkGenerator: GetRenderableContentByTypeName, baseHeadingLevel: number) => K,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
): K[] {
  return members.map((member) => adapter(member, linkGenerator, baseHeadingLevel));
}

function toGroupedFields<T extends Groupable, K>(
  fields: T[],
  adapter: (member: T, linkGenerator: GetRenderableContentByTypeName, baseHeadingLevel: number) => K,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
): GroupedMember<K>[] {
  const groupedFields = groupByGroupName(fields);
  return Object.entries(groupedFields).map(([groupName, fields]) =>
    singleGroup(baseHeadingLevel, groupName, adapter, fields, linkGenerator),
  );
}

function groupByGroupName<T extends Groupable>(members: T[]): Record<string, T[]> {
  return members.reduce((acc, field) => {
    const groupName = field.group ?? 'Other';
    acc[groupName] = acc[groupName] ?? [];
    acc[groupName].push(field);
    return acc;
  }, {} as Record<string, T[]>);
}

function singleGroup<T extends Groupable, K>(
  headingLevel: number,
  groupName: string,
  adapter: (member: T, linkGenerator: GetRenderableContentByTypeName, baseHeadingLevel: number) => K,
  fields: T[],
  linkGenerator: GetRenderableContentByTypeName,
): GroupedMember<K> {
  return {
    headingLevel: headingLevel,
    heading: groupName,
    groupDescription: fields[0].groupDescription, // All fields in the group have the same description
    value: toFlat(fields, adapter, linkGenerator, headingLevel + 1),
  };
}
