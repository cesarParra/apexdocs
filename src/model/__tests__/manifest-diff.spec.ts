import Manifest from '../manifest';
import { EnumMirror } from '@cparra/apex-reflection';
import { ManifestDiff } from '../manifest-diff';
import { Annotation } from '@cparra/apex-reflection/index';

const deprecatedAnnotation: Annotation = {
  rawDeclaration: '@deprecated',
  name: 'deprecated',
  type: 'deprecated',
};

const namespaceAccessibleAnnotation: Annotation = {
  rawDeclaration: '@NamespaceAccessible',
  name: 'namespaceaccessible',
  type: 'namespaceaccessible',
};

it('detects when new types are added', () => {
  const commonType = {
    annotations: [],
    name: 'CommonEnum',
    type_name: 'enum',
    access_modifier: 'public',
  } as EnumMirror;

  const originalManifest = new Manifest([commonType]);

  const addedType = {
    annotations: [],
    name: 'NewEnum',
    type_name: 'enum',
    access_modifier: 'public',
  } as EnumMirror;
  const newManifest = new Manifest([addedType, commonType]);

  const manifestDiff = ManifestDiff.build(originalManifest, newManifest);
  expect(manifestDiff.added.length).toBe(1);
  expect(manifestDiff.added[0].name).toBe('NewEnum');
});

it('detects when types are deleted', () => {
  const commonType = {
    annotations: [],
    name: 'CommonEnum',
    type_name: 'enum',
    access_modifier: 'public',
  } as EnumMirror;

  const deletedType = {
    annotations: [],
    name: 'OldEnum',
    type_name: 'enum',
    access_modifier: 'public',
  } as EnumMirror;
  const originalManifest = new Manifest([commonType, deletedType]);
  const newManifest = new Manifest([commonType]);

  const manifestDiff = ManifestDiff.build(originalManifest, newManifest);
  expect(manifestDiff.deleted.length).toBe(1);
  expect(manifestDiff.deleted[0].name).toBe('OldEnum');
});

it('does not add enums that have no changes', () => {
  const originalEnum = {
    annotations: [],
    name: 'CommonEnum',
    type_name: 'enum',
    access_modifier: 'public',
  } as EnumMirror;

  const modifiedEnum = {
    annotations: [],
    name: 'CommonEnum',
    type_name: 'enum',
    access_modifier: 'public',
  } as EnumMirror;

  const originalManifest = new Manifest([originalEnum]);
  const newManifest = new Manifest([modifiedEnum]);

  const manifestDiff = ManifestDiff.build(originalManifest, newManifest);
  expect(manifestDiff.changes.length).toBe(0);
});

it('detects changes to access modifiers within an enum', () => {
  const originalEnum = {
    annotations: [],
    name: 'CommonEnum',
    type_name: 'enum',
    access_modifier: 'public',
  } as EnumMirror;

  const modifiedEnum = {
    annotations: [],
    name: 'CommonEnum',
    type_name: 'enum',
    access_modifier: 'private',
  } as EnumMirror;

  const originalManifest = new Manifest([originalEnum]);
  const newManifest = new Manifest([modifiedEnum]);

  const manifestDiff = ManifestDiff.build(originalManifest, newManifest);
  expect(manifestDiff.changes.length).toBe(1);
  expect(manifestDiff.changes[0].originalType).toBe(originalEnum);
  expect(manifestDiff.changes[0].newType).toBe(modifiedEnum);
  expect(manifestDiff.changes[0].accessModifierChange).not.toBeNull();
  expect(manifestDiff.changes[0].accessModifierChange?.oldAccessModifier).toBe('public');
  expect(manifestDiff.changes[0].accessModifierChange?.newAccessModifier).toBe('private');
});

it('detects changes to annotations within an enum', () => {
  const originalEnum = {
    annotations: [deprecatedAnnotation],
    name: 'CommonEnum',
    type_name: 'enum',
    access_modifier: 'public',
  } as EnumMirror;

  const modifiedEnum = {
    annotations: [namespaceAccessibleAnnotation],
    name: 'CommonEnum',
    type_name: 'enum',
    access_modifier: 'private',
  } as EnumMirror;

  const originalManifest = new Manifest([originalEnum]);
  const newManifest = new Manifest([modifiedEnum]);

  const manifestDiff = ManifestDiff.build(originalManifest, newManifest);
  expect(manifestDiff.changes.length).toBe(1);
  expect(manifestDiff.changes[0].annotationChanges.length).toBe(2);
  expect(manifestDiff.changes[0].annotationChanges.find((change) => change.type === 'added')?.annotation.name).toBe(
    namespaceAccessibleAnnotation.name,
  );
  expect(manifestDiff.changes[0].annotationChanges.find((change) => change.type === 'removed')?.annotation.name).toBe(
    deprecatedAnnotation.name,
  );
});
