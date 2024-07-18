import Manifest from '../core/manifest';
import { TypeParser } from './parser';
import { ReflectionResult } from '@cparra/apex-reflection';
import ApexBundle from '../core/apex-bundle';

/**
 * Builds a new Manifest object, sourcing its types from the received TypeParser.
 * @param typeParser In charge of returning the list of reflected types.
 * @param reflect Reflection function.
 */
export function createManifest(
  typeParser: TypeParser,
  reflect: (apexBundle: ApexBundle) => ReflectionResult,
): Manifest {
  return new Manifest(typeParser.parse(reflect));
}
