import { Changelog, MemberModificationType, NewOrModifiedMember } from './process-changelog';
import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { RenderableContent } from '../renderables/types';
import { adaptDescribable } from '../renderables/documentables';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';

type NewTypeRenderable = {
  name: string;
  description?: RenderableContent[];
};

type NewTypeSection<T extends 'class' | 'interface' | 'enum'> = {
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
};

export function convertToRenderableChangelog(
  changelog: Changelog,
  newManifest: (Type | CustomObjectMetadata)[],
): RenderableChangelog {
  const allNewTypes = changelog.newApexTypes.map(
    (newType) => newManifest.find((type) => type.name.toLowerCase() === newType.toLowerCase())!,
  );

  const newClasses = allNewTypes.filter((type): type is ClassMirror => type.type_name === 'class');
  const newInterfaces = allNewTypes.filter((type): type is InterfaceMirror => type.type_name === 'interface');
  const newEnums = allNewTypes.filter((type): type is EnumMirror => type.type_name === 'enum');

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
  switch (memberModificationType.__typename) {
    case 'NewEnumValue':
      return `New Enum Value: ${memberModificationType.name}`;
    case 'RemovedEnumValue':
      return `Removed Enum Value: ${memberModificationType.name}`;
    case 'NewMethod':
      return `New Method: ${memberModificationType.name}`;
    case 'RemovedMethod':
      return `Removed Method: ${memberModificationType.name}`;
    case 'NewProperty':
      return `New Property: ${memberModificationType.name}`;
    case 'RemovedProperty':
      return `Removed Property: ${memberModificationType.name}`;
    case 'NewField':
      return `New Field: ${memberModificationType.name}`;
    case 'RemovedField':
      return `Removed Field: ${memberModificationType.name}`;
    case 'NewType':
      return `New Type: ${memberModificationType.name}`;
    case 'RemovedType':
      return `Removed Type: ${memberModificationType.name}`;
    case 'LabelChanged':
      return `Label Changed to ${memberModificationType.name}`;
  }
}
