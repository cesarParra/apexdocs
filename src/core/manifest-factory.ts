import Manifest from './manifest';
import { TypeParser } from './openapi/parser';
import { ReflectionResult } from '@cparra/apex-reflection';
import { SourceFile } from './shared/types';

// TODO: Why do we need a "factory" like this? This could just be a function

/**
 * Builds a new Manifest object, sourcing its types from the received TypeParser.
 * @param typeParser In charge of returning the list of reflected types.
 * @param reflect Reflection function.
 */
export function createManifest(
  typeParser: TypeParser,
  reflect: (apexBundle: SourceFile) => ReflectionResult,
): Manifest {
  return new Manifest(typeParser.parse(reflect));
}
