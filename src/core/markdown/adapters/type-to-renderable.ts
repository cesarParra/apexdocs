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
  RenderableTrigger,
  RenderableCustomObject,
  RenderableCustomField,
  RenderableCustomMetadata,
} from '../../renderables/types';
import { adaptDescribable, adaptDocumentable } from '../../renderables/documentables';
import { adaptConstructor, adaptMethod } from './methods-and-constructors';
import { adaptFieldOrProperty } from './fields-and-properties';
import { MarkdownGeneratorConfig } from '../generate-docs';
import { ExternalMetadata, SourceFileMetadata } from '../../shared/types';
import { CustomObjectMetadata, PublishBehavior } from '../../reflection/sobject/reflect-custom-object-sources';
import { getTypeGroup, isInSource } from '../../shared/utils';
import { CustomFieldMetadata } from '../../reflection/sobject/reflect-custom-field-source';
import { CustomMetadataMetadata } from '../../reflection/sobject/reflect-custom-metadata-source';
import { TriggerMetadata } from 'src/core/reflection/trigger/reflect-trigger-source';

type GetReturnRenderable<T extends Type | CustomObjectMetadata | TriggerMetadata> = T extends InterfaceMirror
  ? RenderableInterface
  : T extends ClassMirror
    ? RenderableClass
    : T extends EnumMirror
      ? RenderableEnum
      : T extends TriggerMetadata
        ? RenderableTrigger
        : RenderableCustomObject;

export function typeToRenderable<T extends Type | CustomObjectMetadata | TriggerMetadata>(
  parsedFile: { source: SourceFileMetadata | ExternalMetadata; type: T },
  linkGenerator: GetRenderableContentByTypeName,
  config: MarkdownGeneratorConfig,
): GetReturnRenderable<T> & { filePath: string | undefined; namespace?: string } {
  function getRenderable():
    | RenderableInterface
    | RenderableClass
    | RenderableEnum
    | RenderableTrigger
    | RenderableCustomObject {
    const { type } = parsedFile;
    switch (type.type_name) {
      case 'enum':
        return enumTypeToEnumSource(type as EnumMirror, linkGenerator);
      case 'interface':
        return interfaceTypeToInterfaceSource(type as InterfaceMirror, linkGenerator);
      case 'class':
        return classTypeToClassSource(type as ClassMirrorWithInheritanceChain, linkGenerator);
      case 'trigger':
        return triggerMetadataToRenderable(type as TriggerMetadata, linkGenerator);
      case 'customobject':
        return objectMetadataToRenderable(type as CustomObjectMetadata, config);
    }
  }

  return {
    ...(getRenderable() as GetReturnRenderable<T>),
    filePath: isInSource(parsedFile.source) ? parsedFile.source.filePath : undefined,
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

function triggerMetadataToRenderable(
  triggerMetadata: TriggerMetadata,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number = 1,
): RenderableTrigger {
  function formatEvent(event: string): string {
    switch (event) {
      case 'beforeinsert':
        return 'Before Insert';
      case 'beforeupdate':
        return 'Before Update';
      case 'beforedelete':
        return 'Before Delete';
      case 'afterinsert':
        return 'After Insert';
      case 'afterupdate':
        return 'After Update';
      case 'afterdelete':
        return 'After Delete';
      case 'afterundelete':
        return 'After Undelete';
      default:
        return event;
    }
  }

  return {
    doc: adaptDocumentable(
      {
        docComment: triggerMetadata.docComment,
        annotations: [],
      },
      linkGenerator,
      baseHeadingLevel + 1,
    ),
    name: triggerMetadata.name,
    type: 'trigger',
    headingLevel: 1,
    heading: triggerMetadata.name + ' Trigger',
    objectName: triggerMetadata.object_name,
    events: triggerMetadata.events.map(formatEvent),
  };
}

function objectMetadataToRenderable(
  objectMetadata: CustomObjectMetadata,
  config: MarkdownGeneratorConfig,
): RenderableCustomObject {
  function toRenderablePublishBehavior(publishBehavior: PublishBehavior | undefined): string | null {
    switch (publishBehavior) {
      case 'PublishImmediately':
        return 'Publish Immediately';
      case 'PublishAfterCommit':
        return 'Publish After Commit';
      default:
        return null;
    }
  }

  return {
    type: 'customobject',
    headingLevel: 1,
    apiName: getApiName(objectMetadata.name, config),
    heading: objectMetadata.label ?? objectMetadata.name,
    name: objectMetadata.name,
    doc: {
      description: objectMetadata.description ? [objectMetadata.description] : [],
      group: getTypeGroup(objectMetadata, config),
    },
    hasFields: objectMetadata.fields.length > 0,
    fields: {
      headingLevel: 2,
      heading: 'Fields',
      value: objectMetadata.fields.map((field) => fieldMetadataToRenderable(field, config, 3)),
    },
    hasRecords: objectMetadata.metadataRecords.length > 0,
    metadataRecords: {
      headingLevel: 2,
      heading: 'Records',
      value: objectMetadata.metadataRecords.map((metadata) => customMetadataToRenderable(metadata, 3)),
    },
    publishBehavior: toRenderablePublishBehavior(objectMetadata.publishBehavior),
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
    heading: field.label ?? field.name,
    description: field.description ? [field.description] : [],
    apiName: getApiName(field.name, config),
    fieldType: field.type,
    required: field.required,
    pickListValues: field.pickListValues
      ? {
          headingLevel: headingLevel + 1,
          heading: 'Possible values are',
          value: field.pickListValues,
        }
      : undefined,
  };
}

function customMetadataToRenderable(metadata: CustomMetadataMetadata, headingLevel: number): RenderableCustomMetadata {
  return {
    type: 'metadata',
    headingLevel: headingLevel,
    heading: metadata.label ?? metadata.name,
    apiName: metadata.apiName,
    label: metadata.label ?? metadata.name,
    protected: metadata.protected,
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
