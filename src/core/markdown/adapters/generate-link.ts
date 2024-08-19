import { StringOrLink } from './types';
import path from 'path';
import { LinkingStrategy } from '../../shared/types';

export type LinkingStrategyFn = (
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  from: string,
  referenceName: string,
) => StringOrLink;

export const generateLink = (strategy: LinkingStrategy): LinkingStrategyFn => {
  switch (strategy) {
    case 'relative':
      return generateRelativeLink;
    case 'no-link':
      return generateNoLink;
    case 'none':
      return returnReferenceAsIs;
  }
};

const generateRelativeLink = (
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  from: string, // The name of the file for which the reference is being generated
  referenceName: string,
): StringOrLink => {
  function getRelativePath(fromPath: string, toPath: string) {
    return path.relative(path.parse(path.join('/', fromPath)).dir, path.join('/', toPath));
  }

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
    return referenceTo.displayName;
  }

  return {
    __type: 'link',
    title: referenceTo.displayName,
    url: getRelativePath(referenceFrom.referencePath, referenceTo.referencePath),
  };
};

const generateNoLink = (
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  _from: string,
  referenceName: string,
): StringOrLink => {
  const referenceTo = references[referenceName];
  return referenceTo ? referenceTo.displayName : referenceName;
};

const returnReferenceAsIs = (
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  _from: string,
  referenceName: string,
): StringOrLink => {
  const referenceTo = references[referenceName];
  if (!referenceTo) {
    return referenceName;
  }

  return {
    __type: 'link',
    title: referenceTo.displayName,
    url: referenceTo.referencePath,
  };
};
