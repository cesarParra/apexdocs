import { Changelog, MemberModificationType, NewOrModifiedMember } from './process-changelog';
import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { RenderableContent } from '../renderables/types';
import { adaptDescribable } from '../renderables/documentables';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { CustomFieldMetadata } from '../reflection/sobject/reflect-custom-field-source';
import { CustomMetadataMetadata } from '../reflection/sobject/reflect-custom-metadata-source';
import { TriggerMetadata } from '../reflection/trigger/reflect-trigger-source';

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
};

export function convertToRenderableChangelog(
  changelog: Changelog,
  newManifest: (Type | CustomObjectMetadata | CustomFieldMetadata | CustomMetadataMetadata | TriggerMetadata)[],
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
            heading: 'New Classes',
            description: 'These classes are new.',
            types: newClasses.map(typeToRenderable),
          }
        : null,
    newInterfaces:
      newInterfaces.length > 0
        ? {
            __type: 'interface',
            heading: 'New Interfaces',
            description: 'These interfaces are new.',
            types: newInterfaces.map(typeToRenderable),
          }
        : null,
    newEnums:
      newEnums.length > 0
        ? {
            __type: 'enum',
            heading: 'New Enums',
            description: 'These enums are new.',
            types: newEnums.map(typeToRenderable),
          }
        : null,
    removedTypes:
      changelog.removedApexTypes.length > 0
        ? { heading: 'Removed Types', description: 'These types have been removed.', types: changelog.removedApexTypes }
        : null,
    newOrModifiedMembers:
      changelog.newOrModifiedApexMembers.length > 0
        ? {
            heading: 'New or Modified Members in Existing Types',
            description: 'These members have been added or modified.',
            modifications: changelog.newOrModifiedApexMembers.map(toRenderableModification),
          }
        : null,
    newCustomObjects:
      newCustomObjects.length > 0
        ? {
            __type: 'customobject',
            heading: 'New Custom Objects',
            description: 'These custom objects are new.',
            types: newCustomObjects.map((type) => ({
              name: type.name,
              description: type.description ? [type.description] : undefined,
            })),
          }
        : null,
    removedCustomObjects:
      changelog.removedCustomObjects.length > 0
        ? {
            heading: 'Removed Custom Objects',
            description: 'These custom objects have been removed.',
            types: changelog.removedCustomObjects,
          }
        : null,
    newOrRemovedCustomFields:
      newOrModifiedCustomFields.length > 0
        ? {
            heading: 'New or Removed Fields to Custom Objects or Standard Objects',
            description: 'These custom fields have been added or removed.',
            modifications: newOrModifiedCustomFields.map(toRenderableModification),
          }
        : null,
    newOrRemovedCustomMetadataTypeRecords:
      newOrModifiedCustomMetadataTypeRecords.length > 0
        ? {
            heading: 'New or Removed Custom Metadata Type Records',
            description: 'These custom metadata type records have been added or removed.',
            modifications: newOrModifiedCustomMetadataTypeRecords.map(toRenderableModification),
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

function toRenderableModification(newOrModifiedMember: NewOrModifiedMember): NewOrModifiedMemberSection {
  return {
    typeName: newOrModifiedMember.typeName,
    modifications: newOrModifiedMember.modifications.map(toRenderableModificationDescription),
  };
}

function toRenderableModificationDescription(memberModificationType: MemberModificationType): string {
  function withDescription(memberModificationType: MemberModificationType): string {
    if (memberModificationType.description) {
      return `${memberModificationType.name}. ${memberModificationType.description}`;
    }
    return memberModificationType.name;
  }

  switch (memberModificationType.__typename) {
    case 'NewEnumValue':
      return `New Enum Value: ${withDescription(memberModificationType)}`;
    case 'RemovedEnumValue':
      return `Removed Enum Value: ${memberModificationType.name}`;
    case 'NewMethod':
      return `New Method: ${withDescription(memberModificationType)}`;
    case 'RemovedMethod':
      return `Removed Method: ${memberModificationType.name}`;
    case 'NewProperty':
      return `New Property: ${withDescription(memberModificationType)}`;
    case 'RemovedProperty':
      return `Removed Property: ${memberModificationType.name}`;
    case 'NewField':
      return `New Field: ${withDescription(memberModificationType)}`;
    case 'RemovedField':
      return `Removed Field: ${memberModificationType.name}`;
    case 'NewType':
      return `New Type: ${withDescription(memberModificationType)}`;
    case 'RemovedType':
      return `Removed Type: ${memberModificationType.name}`;
    case 'NewCustomMetadataRecord':
      return `New Custom Metadata Record: ${withDescription(memberModificationType)}`;
    case 'RemovedCustomMetadataRecord':
      return `Removed Custom Metadata Record: ${memberModificationType.name}`;
  }
}
