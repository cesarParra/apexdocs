import { Changelog } from './process-changelog';
import { Type } from '@cparra/apex-reflection';
import { RenderableContent } from '../renderables/types';
import { adaptDescribable } from '../renderables/documentables';

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

export type RenderableChangelog = {
  newClasses: NewTypeSection<'class'> | null;
  newInterfaces: NewTypeSection<'interface'> | null;
  newEnums: NewTypeSection<'enum'> | null;
  removedTypes: RemovedTypeSection | null;
};

export function convertToRenderableChangelog(changelog: Changelog, newManifest: Type[]): RenderableChangelog {
  const allNewTypes = changelog.newTypes.map(
    (newType) => newManifest.find((type) => type.name.toLowerCase() === newType.toLowerCase())!,
  );

  const newClasses = allNewTypes.filter((type) => type.type_name === 'class');
  const newInterfaces = allNewTypes.filter((type) => type.type_name === 'interface');
  const newEnums = allNewTypes.filter((type) => type.type_name === 'enum');

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
      changelog.removedTypes.length > 0
        ? { heading: 'Removed Types', description: 'These types have been removed.', types: changelog.removedTypes }
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

// Changes...
// TODO: New and removed enum values
// TODO: new and removed mehtods
// TODO: new and removed class members
// TODO: new and removed inner classes
// TODO: new and removed inner interfaces
// TODO: new and removed inner enums
