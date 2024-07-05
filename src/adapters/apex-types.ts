import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import {
  RenderableType,
  RenderableClass,
  RenderableEnum,
  RenderableInterface,
  Renderable,
  RenderableSection,
  RenderableField,
  GroupedRenderableField,
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
    fields: adaptFields(
      classType.fields as FieldMirrorWithInheritance[],
      linkFromTypeNameGenerator,
      baseHeadingLevel + 1,
    ),
    properties: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Properties',
      value: classType.properties.map((property) =>
        adaptFieldOrProperty(property as PropertyMirrorWithInheritance, linkGenerator, baseHeadingLevel + 2),
      ),
    },
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

function anyFieldHasGroup(field: FieldMirrorWithInheritance[]): boolean {
  return field.some((field) => field.group);
}

function groupFieldsByGroupName(fields: FieldMirrorWithInheritance[]): Record<string, FieldMirrorWithInheritance[]> {
  return fields.reduce((acc, field) => {
    const groupName = field.group ?? 'Other';
    acc[groupName] = acc[groupName] ?? [];
    acc[groupName].push(field);
    return acc;
  }, {} as Record<string, FieldMirrorWithInheritance[]>);
}

function adaptFields(
  fields: FieldMirrorWithInheritance[],
  linkFromTypeNameGenerator: GetRenderableContentByTypeName,
  headingLevel: number,
): RenderableSection<RenderableField[] | GroupedRenderableField[]> & { isGrouped: boolean } {
  return {
    headingLevel,
    heading: 'Fields',
    isGrouped: anyFieldHasGroup(fields),
    value: anyFieldHasGroup(fields)
      ? toGroupedFields(fields, linkFromTypeNameGenerator, headingLevel + 1)
      : toFlatFields(fields, linkFromTypeNameGenerator, headingLevel + 1),
  };
}

function toFlatFields(
  fields: FieldMirrorWithInheritance[],
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
): RenderableField[] {
  return fields.map((field) => adaptFieldOrProperty(field, linkGenerator, baseHeadingLevel));
}

function toGroupedFields(
  fields: FieldMirrorWithInheritance[],
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
): GroupedRenderableField[] {
  const groupedFields = groupFieldsByGroupName(fields);
  return Object.entries(groupedFields).map(([groupName, fields]) =>
    singleGroup(baseHeadingLevel, groupName, fields, linkGenerator),
  );
}

function singleGroup(
  headingLevel: number,
  groupName: string,
  fields: FieldMirrorWithInheritance[],
  linkGenerator: GetRenderableContentByTypeName,
): GroupedRenderableField {
  return {
    headingLevel: headingLevel,
    heading: groupName,
    groupDescription: fields[0].groupDescription, // All fields in the group have the same description
    value: toFlatFields(fields, linkGenerator, headingLevel + 1),
  };
}
