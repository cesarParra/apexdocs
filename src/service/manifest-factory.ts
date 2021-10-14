import Manifest from '../model/manifest';
import { TypeParser } from './parser';

/**
 * Builds a new Manifest object, sourcing its types from the received TypeParser.
 * @param typeParser In charge of returning the list of reflected types.
 */
export function createManifest(typeParser: TypeParser): Manifest {
  return new Manifest(typeParser.parse());
}
