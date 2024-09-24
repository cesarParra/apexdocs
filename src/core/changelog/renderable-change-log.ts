import { ChangeLog } from './process-change-log';
import { Type } from '@cparra/apex-reflection';
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

type RenderableChangeLog = {
  newClasses: NewTypeSection<'class'> | null;
};

export function convertToRenderableChangeLog(changeLog: ChangeLog, newManifest: Type[]): RenderableChangeLog {
  const allNewTypes = changeLog.newTypes.map(
    (newType) => newManifest.find((type) => type.name.toLowerCase() === newType.toLowerCase())!,
  );

  const newClasses = allNewTypes.filter((type) => type.type_name === 'class');

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
