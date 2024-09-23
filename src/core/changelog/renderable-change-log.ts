import { ChangeLog } from './process-change-log';
import { Type } from '@cparra/apex-reflection';

type NewTypeSection<T extends 'class' | 'interface' | 'enum'> = {
  __type: T;
  heading: string;
  description: string;
};

type RenderableChangeLog = {
  newClasses: NewTypeSection<'class'> | null;
};

export function convertToRenderableChangeLog(changeLog: ChangeLog, newTypes: Type[]): RenderableChangeLog {
  const hasNewClasses =
    changeLog.newTypes.filter((newType) => newTypes.some((type) => type.name.toLowerCase() === newType.toLowerCase()))
      .length > 0;

  return {
    newClasses: hasNewClasses
      ? { __type: 'class', heading: 'New Classes', description: 'These classes are new.' }
      : null,
  };
}

// TODO:
// New Classes
// New Enums
// New Interfaces

// Removed Classes
// Removed Enums
// Removed Interfaces

// Changes...
