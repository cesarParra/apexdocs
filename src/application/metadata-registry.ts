import * as nodePath from 'path';
import { SourceComponentAdapter } from './source-code-file-reader';

// Source-format metadata classification, replacing @salesforce/source-deploy-retrieve's
// MetadataResolver for the handful of types apexdocs documents. Deliberately lenient:
// classification is by file suffix (and, for LWC, an `lwc/` ancestor) regardless of where
// in the tree the file sits — we'd rather over-document than miss something.
//
// To support a new metadata type, add an entry to `registry`. Keep it data-driven so the
// list can grow toward the dozens of types Salesforce supports without touching the walk.

type ClassifierContext = {
  /** True if `path` exists in the walked file set. */
  has: (path: string) => boolean;
};

type MetadataTypeDef = {
  name: string;
  id: string;
  /** File suffix that identifies this type. */
  suffix: string;
  /** Build the component, or return null to decline (e.g. wrong directory). */
  build: (filePath: string, ctx: ClassifierContext) => Omit<SourceComponentAdapter, 'type'> | null;
};

function baseName(filePath: string, suffix: string): string {
  return nodePath.basename(filePath, suffix);
}

export const registry: MetadataTypeDef[] = [
  {
    name: 'ApexClass',
    id: 'apexclass',
    suffix: '.cls',
    build: (filePath, ctx) => {
      const xml = `${filePath}-meta.xml`;
      return { name: baseName(filePath, '.cls'), content: filePath, xml: ctx.has(xml) ? xml : undefined };
    },
  },
  {
    name: 'ApexTrigger',
    id: 'apextrigger',
    suffix: '.trigger',
    build: (filePath, ctx) => {
      const xml = `${filePath}-meta.xml`;
      return { name: baseName(filePath, '.trigger'), content: filePath, xml: ctx.has(xml) ? xml : undefined };
    },
  },
  {
    name: 'LightningComponentBundle',
    id: 'lightningcomponentbundle',
    suffix: '.js-meta.xml',
    build: (filePath) => {
      const segments = filePath.split(nodePath.sep);
      // Only treat as LWC if it lives under an `lwc/` directory (excludes aura and stray files).
      if (!segments.includes('lwc')) {
        return null;
      }
      // The bundle name is its containing directory, e.g. lwc/myCmp/myCmp.js-meta.xml -> myCmp.
      return { name: nodePath.basename(nodePath.dirname(filePath)), xml: filePath };
    },
  },
  {
    name: 'CustomObject',
    id: 'customobject',
    suffix: '.object-meta.xml',
    build: (filePath) => ({
      name: baseName(filePath, '.object-meta.xml'),
      xml: filePath,
      // Content is the object directory (used by consumers as a location anchor).
      content: nodePath.dirname(filePath),
    }),
  },
  {
    name: 'CustomField',
    id: 'customfield',
    suffix: '.field-meta.xml',
    build: (filePath) => ({
      name: baseName(filePath, '.field-meta.xml'),
      xml: filePath,
      // Path is objects/<Object>/fields/<Field>.field-meta.xml — parent is the object directory.
      parent: { name: nodePath.basename(nodePath.dirname(nodePath.dirname(filePath))) },
    }),
  },
  {
    name: 'CustomMetadata',
    id: 'custommetadata',
    suffix: '.md-meta.xml',
    // name is the full "Type.Record" api name (consumers split it apart themselves).
    build: (filePath) => ({ name: baseName(filePath, '.md-meta.xml'), xml: filePath }),
  },
];

/**
 * Classifies a single file into a SourceComponentAdapter, or returns null if it is not a
 * recognized, documentable metadata file.
 */
export function classify(filePath: string, ctx: ClassifierContext): SourceComponentAdapter | null {
  for (const def of registry) {
    if (!filePath.endsWith(def.suffix)) {
      continue;
    }
    const built = def.build(filePath, ctx);
    if (built) {
      return { ...built, type: { id: def.id, name: def.name } };
    }
  }
  return null;
}
