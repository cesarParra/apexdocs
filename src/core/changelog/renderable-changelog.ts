import { Changelog, MemberModificationType, NewOrModifiedMember } from './process-changelog';
import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { RenderableContent } from '../renderables/types';
import { adaptDescribable } from '../renderables/documentables';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { Translations } from '../translations';
import { ParsedType } from '../shared/types';

type NewTypeRenderable = {
  name: string;
  description?: RenderableContent[];
};

type NewTypeSection<T extends 'class' | 'interface' | 'enum' | 'customobject'> = {
  __type: T;
  heading: string;
  description: string;
  types: NewTypeRenderable[];
};

type NewOrRemovedTriggerSection = {
  heading: string;
  description: string;
  triggerData: {
    triggerName: string;
    objectName: string;
  }[];
};

type RemovedTypeSection = {
  heading: string;
  description: string;
  types: string[];
};

type NewOrModifiedMemberSection = {
  typeName: string;
  modifications: string[];
};

type NewOrModifiedMembersSection = {
  heading: string;
  description: string;
  modifications: NewOrModifiedMemberSection[];
};

export type RenderableChangelog = {
  newClasses: NewTypeSection<'class'> | null;
  newInterfaces: NewTypeSection<'interface'> | null;
  newEnums: NewTypeSection<'enum'> | null;
  removedTypes: RemovedTypeSection | null;
  newOrModifiedMembers: NewOrModifiedMembersSection | null;
  newCustomObjects: NewTypeSection<'customobject'> | null;
  removedCustomObjects: RemovedTypeSection | null;
  newOrRemovedCustomFields: NewOrModifiedMembersSection | null;
  newOrRemovedCustomMetadataTypeRecords: NewOrModifiedMembersSection | null;
  newTriggers: NewOrRemovedTriggerSection | null;
  removedTriggers: NewOrRemovedTriggerSection | null;
};

export function convertToRenderableChangelog(
  changelog: Changelog,
  newManifest: ParsedType[],
  translations: Translations,
): RenderableChangelog {
  const allNewTypes = [...changelog.newApexTypes, ...changelog.newCustomObjects].map(
    (newType) => newManifest.find((type) => type.name.toLowerCase() === newType.toLowerCase())!,
  );

  const newClasses = allNewTypes.filter((type): type is ClassMirror => type.type_name === 'class');
  const newInterfaces = allNewTypes.filter((type): type is InterfaceMirror => type.type_name === 'interface');
  const newEnums = allNewTypes.filter((type): type is EnumMirror => type.type_name === 'enum');
  const newCustomObjects = allNewTypes.filter(
    (type): type is CustomObjectMetadata => type.type_name === 'customobject',
  );
  const newOrModifiedCustomFields = changelog.customObjectModifications.filter(
    (modification): modification is NewOrModifiedMember =>
      modification.modifications.some((mod) => mod.__typename === 'NewField' || mod.__typename === 'RemovedField'),
  );
  const newOrModifiedCustomMetadataTypeRecords = changelog.customObjectModifications.filter(
    (modification): modification is NewOrModifiedMember =>
      modification.modifications.some(
        (mod) => mod.__typename === 'NewCustomMetadataRecord' || mod.__typename === 'RemovedCustomMetadataRecord',
      ),
  );

  return {
    newClasses:
      newClasses.length > 0
        ? {
            __type: 'class',
            heading: translations.changelog.newClasses.heading,
            description: translations.changelog.newClasses.description,
            types: newClasses.map(typeToRenderable),
          }
        : null,
    newInterfaces:
      newInterfaces.length > 0
        ? {
            __type: 'interface',
            heading: translations.changelog.newInterfaces.heading,
            description: translations.changelog.newInterfaces.description,
            types: newInterfaces.map(typeToRenderable),
          }
        : null,
    newEnums:
      newEnums.length > 0
        ? {
            __type: 'enum',
            heading: translations.changelog.newEnums.heading,
            description: translations.changelog.newEnums.description,
            types: newEnums.map(typeToRenderable),
          }
        : null,
    removedTypes:
      changelog.removedApexTypes.length > 0
        ? {
            heading: translations.changelog.removedTypes.heading,
            description: translations.changelog.removedTypes.description,
            types: changelog.removedApexTypes,
          }
        : null,
    newOrModifiedMembers:
      changelog.newOrModifiedApexMembers.length > 0
        ? {
            heading: translations.changelog.newOrModifiedMembers.heading,
            description: translations.changelog.newOrModifiedMembers.description,
            modifications: changelog.newOrModifiedApexMembers.map((member) =>
              toRenderableModification(member, translations),
            ),
          }
        : null,
    newCustomObjects:
      newCustomObjects.length > 0
        ? {
            __type: 'customobject',
            heading: translations.changelog.newCustomObjects.heading,
            description: translations.changelog.newCustomObjects.description,
            types: newCustomObjects.map((type) => ({
              name: type.name,
              description: type.description ? [type.description] : undefined,
            })),
          }
        : null,
    removedCustomObjects:
      changelog.removedCustomObjects.length > 0
        ? {
            heading: translations.changelog.removedCustomObjects.heading,
            description: translations.changelog.removedCustomObjects.description,
            types: changelog.removedCustomObjects,
          }
        : null,
    newOrRemovedCustomFields:
      newOrModifiedCustomFields.length > 0
        ? {
            heading: translations.changelog.newOrRemovedCustomFields.heading,
            description: translations.changelog.newOrRemovedCustomFields.description,
            modifications: newOrModifiedCustomFields.map((member) => toRenderableModification(member, translations)),
          }
        : null,
    newOrRemovedCustomMetadataTypeRecords:
      newOrModifiedCustomMetadataTypeRecords.length > 0
        ? {
            heading: translations.changelog.newOrRemovedCustomMetadataTypeRecords.heading,
            description: translations.changelog.newOrRemovedCustomMetadataTypeRecords.description,
            modifications: newOrModifiedCustomMetadataTypeRecords.map((member) =>
              toRenderableModification(member, translations),
            ),
          }
        : null,
    newTriggers:
      changelog.newTriggers.length > 0
        ? {
            heading: translations.changelog.newTriggers.heading,
            description: translations.changelog.newTriggers.description,
            triggerData: changelog.newTriggers.map((trigger) => ({
              triggerName: trigger.triggerName,
              objectName: trigger.objectName,
            })),
          }
        : null,
    removedTriggers:
      changelog.removedTriggers.length > 0
        ? {
            heading: translations.changelog.removedTriggers.heading,
            description: translations.changelog.removedTriggers.description,
            triggerData: changelog.removedTriggers.map((trigger) => ({
              triggerName: trigger.triggerName,
              objectName: trigger.objectName,
            })),
          }
        : null,
  };
}

function typeToRenderable(type: Type): NewTypeRenderable {
  function adapt() {
    const describable = adaptDescribable(type.docComment?.descriptionLines, (typeName) => typeName);
    return describable.description;
  }

  return {
    name: type.name,
    description: adapt(),
  };
}

function toRenderableModification(
  newOrModifiedMember: NewOrModifiedMember,
  translations: Translations,
): NewOrModifiedMemberSection {
  return {
    typeName: newOrModifiedMember.typeName,
    modifications: newOrModifiedMember.modifications.map((mod) =>
      toRenderableModificationDescription(mod, translations),
    ),
  };
}

function toRenderableModificationDescription(
  memberModificationType: MemberModificationType,
  translations: Translations,
): string {
  function withDescription(memberModificationType: MemberModificationType): string {
    if (memberModificationType.description) {
      return `${memberModificationType.name}. ${memberModificationType.description}`;
    }
    return memberModificationType.name;
  }

  switch (memberModificationType.__typename) {
    case 'NewEnumValue':
      return `${translations.changelog.memberModifications.newEnumValue}: ${withDescription(memberModificationType)}`;
    case 'RemovedEnumValue':
      return `${translations.changelog.memberModifications.removedEnumValue}: ${memberModificationType.name}`;
    case 'NewMethod':
      return `${translations.changelog.memberModifications.newMethod}: ${withDescription(memberModificationType)}`;
    case 'RemovedMethod':
      return `${translations.changelog.memberModifications.removedMethod}: ${memberModificationType.name}`;
    case 'NewProperty':
      return `${translations.changelog.memberModifications.newProperty}: ${withDescription(memberModificationType)}`;
    case 'RemovedProperty':
      return `${translations.changelog.memberModifications.removedProperty}: ${memberModificationType.name}`;
    case 'NewField':
      return `${translations.changelog.memberModifications.newField}: ${withDescription(memberModificationType)}`;
    case 'RemovedField':
      return `${translations.changelog.memberModifications.removedField}: ${memberModificationType.name}`;
    case 'NewType':
      return `${translations.changelog.memberModifications.newType}: ${withDescription(memberModificationType)}`;
    case 'RemovedType':
      return `${translations.changelog.memberModifications.removedType}: ${memberModificationType.name}`;
    case 'NewCustomMetadataRecord':
      return `${translations.changelog.memberModifications.newCustomMetadataRecord}: ${withDescription(memberModificationType)}`;
    case 'RemovedCustomMetadataRecord':
      return `${translations.changelog.memberModifications.removedCustomMetadataRecord}: ${memberModificationType.name}`;
    case 'NewTrigger':
      return `${translations.changelog.memberModifications.newTrigger}: ${withDescription(memberModificationType)}`;
    case 'RemovedTrigger':
      return `${translations.changelog.memberModifications.removedTrigger}: ${memberModificationType.name}`;
  }
}
