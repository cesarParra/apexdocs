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
  RenderableCustomMetadata, RenderableLwc,
} from '../../renderables/types';
import { adaptDescribable, adaptDocumentable } from '../../renderables/documentables';
import { adaptConstructor, adaptMethod } from './methods-and-constructors';
import { adaptFieldOrProperty } from './fields-and-properties';
import { MarkdownGeneratorConfig } from '../generate-docs';
import { ExternalMetadata, SourceFileMetadata, TopLevelType } from '../../shared/types';
import { CustomObjectMetadata, PublishBehavior } from '../../reflection/sobject/reflect-custom-object-sources';
import { getTypeGroup, isInSource } from '../../shared/utils';
import { CustomFieldMetadata } from '../../reflection/sobject/reflect-custom-field-source';
import { CustomMetadataMetadata } from '../../reflection/sobject/reflect-custom-metadata-source';
import { TriggerMetadata } from 'src/core/reflection/trigger/reflect-trigger-source';
import { Translations } from '../../translations';
import { LwcMetadata } from '../../reflection/lwc/reflect-lwc-source';

type GetReturnRenderable<T extends TopLevelType> = T extends InterfaceMirror
  ? RenderableInterface
  : T extends ClassMirror
    ? RenderableClass
    : T extends EnumMirror
      ? RenderableEnum
      : T extends TriggerMetadata
        ? RenderableTrigger
        : RenderableCustomObject;

export function typeToRenderable<T extends TopLevelType>(
  parsedFile: { source: SourceFileMetadata | ExternalMetadata; type: T },
  linkGenerator: GetRenderableContentByTypeName,
  config: MarkdownGeneratorConfig,
  translations: Translations,
): GetReturnRenderable<T> & { filePath: string | undefined; namespace?: string } {
  function getRenderable():
    | RenderableInterface
    | RenderableClass
    | RenderableEnum
    | RenderableTrigger
    | RenderableCustomObject
    | RenderableLwc {
    const { type } = parsedFile;
    switch (type.type_name) {
      case 'enum':
        return enumTypeToEnumSource(type as EnumMirror, linkGenerator, 1, translations);
      case 'interface':
        return interfaceTypeToInterfaceSource(type as InterfaceMirror, linkGenerator, 1, translations);
      case 'class':
        return classTypeToClassSource(type as ClassMirrorWithInheritanceChain, linkGenerator, 1, translations);
      case 'trigger':
        return triggerMetadataToRenderable(type as TriggerMetadata, linkGenerator, 1, translations);
      case 'customobject':
        return objectMetadataToRenderable(type as CustomObjectMetadata, config, translations);
      case 'lwc':
        return lwcMetadataToRenderable(type as LwcMetadata);
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
  translations: Translations,
): RenderableType {
  function getHeading(type: Type): string {
    const suffixMap = {
      class: translations.markdown.typeSuffixes.class,
      interface: translations.markdown.typeSuffixes.interface,
      enum: translations.markdown.typeSuffixes.enum,
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
  translations: Translations,
): RenderableEnum {
  return {
    type: 'enum',
    ...baseTypeAdapter(enumType, linkGenerator, baseHeadingLevel, translations),
    values: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.sections.values,
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
  translations: Translations,
): RenderableInterface {
  return {
    type: 'interface',
    ...baseTypeAdapter(interfaceType, linkGenerator, baseHeadingLevel, translations),
    extends: interfaceType.extended_interfaces.map(linkGenerator),
    methods: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.sections.methods,
      value: interfaceType.methods.map((method) =>
        adaptMethod(method, linkGenerator, baseHeadingLevel + 2, translations),
      ),
    },
  };
}

function classTypeToClassSource(
  classType: ClassMirrorWithInheritanceChain,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number = 1,
  translations: Translations,
): RenderableClass {
  return {
    type: 'class',
    ...baseTypeAdapter(classType, linkGenerator, baseHeadingLevel, translations),
    classModifier: classType.classModifier,
    sharingModifier: classType.sharingModifier,
    implements: classType.implemented_interfaces.map(linkGenerator),
    extends: classType.inheritanceChain.map(linkGenerator),
    methods: adaptMembers(
      translations.markdown.sections.methods,
      classType.methods,
      adaptMethod,
      linkGenerator,
      baseHeadingLevel + 1,
      translations,
    ),
    constructors: adaptMembers(
      translations.markdown.sections.constructors,
      classType.constructors,
      (constructor, linkGenerator, baseHeadingLevel, translations) =>
        adaptConstructor(classType.name, constructor, linkGenerator, baseHeadingLevel, translations),
      linkGenerator,
      baseHeadingLevel + 1,
      translations,
    ),
    fields: adaptMembers(
      translations.markdown.sections.fields,
      classType.fields as FieldMirrorWithInheritance[],
      adaptFieldOrProperty,
      linkGenerator,
      baseHeadingLevel + 1,
      translations,
    ),
    properties: adaptMembers(
      translations.markdown.sections.properties,
      classType.properties as PropertyMirrorWithInheritance[],
      adaptFieldOrProperty,
      linkGenerator,
      baseHeadingLevel + 1,
      translations,
    ),
    innerClasses: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.sections.classes,
      value: classType.classes.map((innerClass) =>
        classTypeToClassSource(
          { ...innerClass, inheritanceChain: [] },
          linkGenerator,
          baseHeadingLevel + 2,
          translations,
        ),
      ),
    },
    innerEnums: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.sections.enums,
      value: classType.enums.map((innerEnum) =>
        enumTypeToEnumSource(innerEnum, linkGenerator, baseHeadingLevel + 2, translations),
      ),
    },
    innerInterfaces: {
      headingLevel: baseHeadingLevel + 1,
      heading: translations.markdown.sections.interfaces,
      value: classType.interfaces.map((innerInterface) =>
        interfaceTypeToInterfaceSource(innerInterface, linkGenerator, baseHeadingLevel + 2, translations),
      ),
    },
  };
}

type Groupable = { group?: string; groupDescription?: string };

function adaptMembers<T extends Groupable, K>(
  heading: string,
  members: T[],
  adapter: (
    member: T,
    linkGenerator: GetRenderableContentByTypeName,
    baseHeadingLevel: number,
    translations: Translations,
  ) => K,
  linkFromTypeNameGenerator: GetRenderableContentByTypeName,
  headingLevel: number,
  translations: Translations,
): RenderableSection<K[] | GroupedMember<K>[]> & { isGrouped: boolean } {
  return {
    headingLevel,
    heading,
    isGrouped: hasGroup(members),
    value: hasGroup(members)
      ? toGroupedMembers(members, adapter, linkFromTypeNameGenerator, headingLevel + 1, translations)
      : toFlat(members, adapter, linkFromTypeNameGenerator, headingLevel + 1, translations),
  };
}

function hasGroup(members: Groupable[]): boolean {
  return members.some((member) => member.group);
}

function toFlat<T extends Groupable, K>(
  members: T[],
  adapter: (
    member: T,
    linkGenerator: GetRenderableContentByTypeName,
    baseHeadingLevel: number,
    translations: Translations,
  ) => K,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
  translations: Translations,
): K[] {
  return members.map((member) => adapter(member, linkGenerator, baseHeadingLevel, translations));
}

function toGroupedMembers<T extends Groupable, K>(
  members: T[],
  adapter: (
    member: T,
    linkGenerator: GetRenderableContentByTypeName,
    baseHeadingLevel: number,
    translations: Translations,
  ) => K,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number,
  translations: Translations,
): GroupedMember<K>[] {
  const groupedMembers = groupByGroupName(members);
  return Object.entries(groupedMembers).map(([groupName, members]) =>
    singleGroup(baseHeadingLevel, groupName, adapter, members, linkGenerator, translations),
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
  adapter: (
    member: T,
    linkGenerator: GetRenderableContentByTypeName,
    baseHeadingLevel: number,
    translations: Translations,
  ) => K,
  members: T[],
  linkGenerator: GetRenderableContentByTypeName,
  translations: Translations,
): GroupedMember<K> {
  return {
    headingLevel: headingLevel,
    heading: groupName,
    groupDescription: members[0].groupDescription, // All fields in the group have the same description
    value: toFlat(members, adapter, linkGenerator, headingLevel + 1, translations),
  };
}

function triggerMetadataToRenderable(
  triggerMetadata: TriggerMetadata,
  linkGenerator: GetRenderableContentByTypeName,
  baseHeadingLevel: number = 1,
  translations: Translations,
): RenderableTrigger {
  function formatEvent(event: string): string {
    switch (event) {
      case 'beforeinsert':
        return translations.markdown.triggerEvents.beforeInsert;
      case 'beforeupdate':
        return translations.markdown.triggerEvents.beforeUpdate;
      case 'beforedelete':
        return translations.markdown.triggerEvents.beforeDelete;
      case 'afterinsert':
        return translations.markdown.triggerEvents.afterInsert;
      case 'afterupdate':
        return translations.markdown.triggerEvents.afterUpdate;
      case 'afterdelete':
        return translations.markdown.triggerEvents.afterDelete;
      case 'afterundelete':
        return translations.markdown.triggerEvents.afterUndelete;
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
    heading: triggerMetadata.name + ' ' + translations.markdown.typeSuffixes.trigger,
    objectName: triggerMetadata.object_name,
    events: triggerMetadata.events.map(formatEvent),
  };
}

function objectMetadataToRenderable(
  objectMetadata: CustomObjectMetadata,
  config: MarkdownGeneratorConfig,
  translations: Translations,
): RenderableCustomObject {
  function toRenderablePublishBehavior(publishBehavior: PublishBehavior | undefined): string | null {
    switch (publishBehavior) {
      case 'PublishImmediately':
        return translations.markdown.publishBehaviors.publishImmediately;
      case 'PublishAfterCommit':
        return translations.markdown.publishBehaviors.publishAfterCommit;
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
      heading: translations.markdown.sections.fields,
      value: objectMetadata.fields.map((field) => fieldMetadataToRenderable(field, config, 3, translations)),
    },
    hasRecords: objectMetadata.metadataRecords.length > 0,
    metadataRecords: {
      headingLevel: 2,
      heading: translations.markdown.sections.records,
      value: objectMetadata.metadataRecords.map((metadata) => customMetadataToRenderable(metadata, 3)),
    },
    publishBehavior: toRenderablePublishBehavior(objectMetadata.publishBehavior),
  };
}

function fieldMetadataToRenderable(
  field: CustomFieldMetadata,
  config: MarkdownGeneratorConfig,
  headingLevel: number,
  translations: Translations,
): RenderableCustomField {
  return {
    type: 'field',
    headingLevel: headingLevel,
    heading: field.label ?? field.name,
    description: field.description ? [field.description] : [],
    apiName: getApiName(field.name, config),
    fieldType: field.type,
    required: field.required,
    complianceGroup: renderComplianceGroup(field.complianceGroup, config),
    securityClassification: renderComplianceGroup(field.securityClassification, config),
    inlineHelpText: renderInlineHelpText(field.inlineHelpText, config),
    pickListValues: field.pickListValues
      ? {
        headingLevel: headingLevel + 1,
        heading: translations.markdown.details.possibleValues,
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

function lwcMetadataToRenderable(metadata: LwcMetadata): RenderableLwc {
  return {
    type: 'lwc',
    headingLevel: 1,
    heading: metadata.name + ' (LWC)',
    name: metadata.name,
    doc: {
      // TODO
      description: undefined
    }
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

function renderComplianceGroup(complianceGroup: string | null, config: MarkdownGeneratorConfig) {
  if (config.includeFieldSecurityMetadata) {
    return complianceGroup;
  } else {
    return null;
  }
}

function renderInlineHelpText(inlineHelpText: string | null, config: MarkdownGeneratorConfig) {
  if (config.includeInlineHelpTextMetadata) {
    return inlineHelpText;
  } else {
    return null;
  }
}
