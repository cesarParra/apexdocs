import { ChangeLog } from './process-change-log';
import { Type } from '@cparra/apex-reflection';
// TODO: For these 2 imports, we should move the adapters and documentables to a shared place to not have to get into the markdown folder
import { RenderableContent } from '../markdown/adapters/types';
import { adaptDescribable } from '../markdown/adapters/documentables';

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

export type RenderableChangeLog = {
  newClasses: NewTypeSection<'class'> | null;
  newInterfaces: NewTypeSection<'interface'> | null;
  newEnums: NewTypeSection<'enum'> | null;
};

export function convertToRenderableChangeLog(changeLog: ChangeLog, newManifest: Type[]): RenderableChangeLog {
  const allNewTypes = changeLog.newTypes.map(
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

// TODO: New Enums
// TODO: New Interfaces

// TODO: Removed Classes
// TODO: Removed Enums
// TODO: Removed Interfaces

// Changes...
