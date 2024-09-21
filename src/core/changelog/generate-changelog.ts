import { Type } from '@cparra/apex-reflection';

type VersionManifest = {
  types: Type[];
};

type ChangeLog = {
  newTypes: string[];
};

export function generateChangeLog(oldVersion: VersionManifest, newVersion: VersionManifest): ChangeLog {
  return {
    newTypes: getNewClasses(oldVersion, newVersion),
  };
}

function getNewClasses(oldVersion: VersionManifest, newVersion: VersionManifest): string[] {
  return newVersion.types
    .filter((newType) => !oldVersion.types.some((oldType) => oldType.name.toLowerCase() === newType.name.toLowerCase()))
    .map((type) => type.name);
}
