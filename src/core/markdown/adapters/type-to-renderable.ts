import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import {
  RenderableType,
  RenderableClass,
  RenderableEnum,
  RenderableInterface,
  RenderableSection,
  GroupedMember,
  ClassMirrorWithInheritanceChain,
  FieldMirrorWithInheritance,
  PropertyMirrorWithInheritance,
  GetRenderableContentByTypeName,
  RenderableCustomObject,
  RenderableCustomField,
} from '../../renderables/types';
import { adaptDescribable, adaptDocumentable } from '../../renderables/documentables';
import { adaptConstructor, adaptMethod } from './methods-and-constructors';
import { adaptFieldOrProperty } from './fields-and-properties';
import { MarkdownGeneratorConfig } from '../generate-docs';
import { SourceFileMetadata } from '../../shared/types';
import { CustomObjectMetadata } from '../../reflection/sobject/reflect-custom-object-sources';
import { getTypeGroup } from '../../shared/utils';
import { CustomFieldMetadata } from '../../reflection/sobject/reflect-custom-field-source';

type GetReturnRenderable<T extends Type | CustomObjectMetadata> = T extends InterfaceMirror
  ? RenderableInterface
  : T extends ClassMirror
    ? RenderableClass
    : T extends EnumMirror
      ? RenderableEnum
      : RenderableCustomObject;

export function typeToRenderable<T extends Type | CustomObjectMetadata>(
  parsedFile: { source: SourceFileMetadata; type: T },
  linkGenerator: GetRenderableContentByTypeName,
  config: MarkdownGeneratorConfig,
): GetReturnRenderable<T> & { filePath: string; namespace?: string } {
  function getRenderable(): RenderableInterface | RenderableClass | RenderableEnum | RenderableCustomObject {
    const { type } = parsedFile;
    switch (type.type_name) {
      case 'enum':
        return enumTypeToEnumSource(type as EnumMirror, linkGenerator);
      case 'interface':
        return interfaceTypeToInterfaceSource(type as InterfaceMirror, linkGenerator);
      case 'class':
        return classTypeToClassSource(type as ClassMirrorWithInheritanceChain, linkGenerator);
      case 'customobject':
        return objectMetadataToRenderable(type as CustomObjectMetadata, config);
    }
  }

  return {
    ...(getRenderable() as GetReturnRenderable<T>),
    filePath: parsedFile.source.filePath,
    namespace: config.namespace,
  };
}

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

function enumTypeToEnumSource(
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

function interfaceTypeToInterfaceSource(
  interfaceType: InterfaceMirror,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number = 1,
): RenderableInterface {
  return {
    type: 'interface',
    ...baseTypeAdapter(interfaceType, linkGenerator, baseHeadingLevel),
    extends: interfaceType.extended_interfaces.map(linkGenerator),
    methods: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Methods',
      value: interfaceType.methods.map((method) => adaptMethod(method, linkGenerator, baseHeadingLevel + 2)),
    },
  };
}

function classTypeToClassSource(
  classType: ClassMirrorWithInheritanceChain,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number = 1,
): RenderableClass {
  return {
    type: 'class',
    ...baseTypeAdapter(classType, linkGenerator, baseHeadingLevel),
    classModifier: classType.classModifier,
    sharingModifier: classType.sharingModifier,
    implements: classType.implemented_interfaces.map(linkGenerator),
    extends: classType.inheritanceChain.map(linkGenerator),
    methods: adaptMembers('Methods', classType.methods, adaptMethod, linkGenerator, baseHeadingLevel + 1),
    constructors: adaptMembers(
      'Constructors',
      classType.constructors,
      (constructor, linkGenerator, baseHeadingLevel) =>
        adaptConstructor(classType.name, constructor, linkGenerator, baseHeadingLevel),
      linkGenerator,
      baseHeadingLevel + 1,
    ),
    fields: adaptMembers(
      'Fields',
      classType.fields as FieldMirrorWithInheritance[],
      adaptFieldOrProperty,
      linkGenerator,
      baseHeadingLevel + 1,
    ),
    properties: adaptMembers(
      'Properties',
      classType.properties as PropertyMirrorWithInheritance[],
      adaptFieldOrProperty,
      linkGenerator,
      baseHeadingLevel + 1,
    ),
    innerClasses: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Classes',
      value: classType.classes.map((innerClass) =>
        classTypeToClassSource({ ...innerClass, inheritanceChain: [] }, linkGenerator, baseHeadingLevel + 2),
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
  members: T[],
  adapter: (member: T, linkGenerator: GetRenderableContentByTypeName, baseHeadingLevel: number) => K,
  linkFromTypeNameGenerator: GetRenderableContentByTypeName,
  headingLevel: number,
): RenderableSection<K[] | GroupedMember<K>[]> & { isGrouped: boolean } {
  return {
    headingLevel,
    heading,
    isGrouped: hasGroup(members),
    value: hasGroup(members)
      ? toGroupedMembers(members, adapter, linkFromTypeNameGenerator, headingLevel + 1)
      : toFlat(members, adapter, linkFromTypeNameGenerator, headingLevel + 1),
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

function toGroupedMembers<T extends Groupable, K>(
  members: T[],
  adapter: (member: T, linkGenerator: GetRenderableContentByTypeName, baseHeadingLevel: number) => K,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
): GroupedMember<K>[] {
  const groupedMembers = groupByGroupName(members);
  return Object.entries(groupedMembers).map(([groupName, members]) =>
    singleGroup(baseHeadingLevel, groupName, adapter, members, linkGenerator),
  );
}

function groupByGroupName<T extends Groupable>(members: T[]): Record<string, T[]> {
  return members.reduce(
    (acc, member) => {
      const groupName = member.group ?? 'Other';
      acc[groupName] = acc[groupName] ?? [];
      acc[groupName].push(member);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

function singleGroup<T extends Groupable, K>(
  headingLevel: number,
  groupName: string,
  adapter: (member: T, linkGenerator: GetRenderableContentByTypeName, baseHeadingLevel: number) => K,
  members: T[],
  linkGenerator: GetRenderableContentByTypeName,
): GroupedMember<K> {
  return {
    headingLevel: headingLevel,
    heading: groupName,
    groupDescription: members[0].groupDescription, // All fields in the group have the same description
    value: toFlat(members, adapter, linkGenerator, headingLevel + 1),
  };
}

function objectMetadataToRenderable(
  objectMetadata: CustomObjectMetadata,
  config: MarkdownGeneratorConfig,
): RenderableCustomObject {
  return {
    type: 'customobject',
    headingLevel: 1,
    apiName: getApiName(objectMetadata.name, config),
    heading: objectMetadata.label,
    name: objectMetadata.name,
    doc: {
      description: objectMetadata.description ? [objectMetadata.description] : [],
      group: getTypeGroup(objectMetadata, config),
    },
    hasFields: objectMetadata.fields.length > 0,
    fields: {
      headingLevel: 2,
      heading: 'Fields',
      value: objectMetadata.fields.map((field) => fieldMetadataToRenderable(field.type, config, 3)),
    },
  };
}

function fieldMetadataToRenderable(
  field: CustomFieldMetadata,
  config: MarkdownGeneratorConfig,
  headingLevel: number,
): RenderableCustomField {
  return {
    type: 'field',
    headingLevel: headingLevel,
    heading: field.label,
    description: field.description ? [field.description] : [],
    apiName: getApiName(field.name, config),
    fieldType: field.type,
  };
}

function getApiName(currentName: string, config: MarkdownGeneratorConfig) {
  if (config.namespace) {
    // first remove any `__c` suffix
    const name = currentName.replace(/__c$/, '');
    // if the name still has an __, it's already namespaced
    if (name.includes('__')) {
      return name;
    }

    return `${config.namespace}__${currentName}`;
  }
  return currentName;
}
