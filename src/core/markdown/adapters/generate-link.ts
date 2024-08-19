import { StringOrLink } from './types';
import path from 'path';

export const generateLink = (
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  from: string, // The name of the file for which the reference is being generated
  referenceName: string,
): StringOrLink => {
  const referenceTo = references[referenceName];
  if (!referenceTo) {
    return referenceName;
  }
  // When linking from the base path (e.g. the reference guide/index page), the reference path is the same as the output
  // path.
  if (referenceTo && from === '__base__') {
    return {
      __type: 'link',
      title: referenceTo.displayName,
      url: getRelativePath('', referenceTo.referencePath),
    };
  }

  const referenceFrom = references[from];

  if (!referenceFrom) {
    return referenceName;
  }

  return {
    __type: 'link',
    title: referenceTo.displayName,
    url: getRelativePath(referenceFrom.referencePath, referenceTo.referencePath),
  };
};

function getRelativePath(fromPath: string, toPath: string) {
  return path.relative(path.parse(path.join('/', fromPath)).dir, path.join('/', toPath));
}
