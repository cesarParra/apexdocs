import Manifest from '../manifest';
import { TypeParser } from './parser';
import { ReflectionResult } from '@cparra/apex-reflection';
import { UnparsedApexBundle } from '../shared/types';

/**
 * Builds a new Manifest object, sourcing its types from the received TypeParser.
 * @param typeParser In charge of returning the list of reflected types.
 * @param reflect Reflection function.
 */
export function createManifest(
  typeParser: TypeParser,
  reflect: (apexBundle: UnparsedApexBundle) => ReflectionResult,
): Manifest {
  return new Manifest(typeParser.parse(reflect));
}
