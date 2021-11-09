import Manifest from './manifest';
import { Type } from '@cparra/apex-reflection';
import { Annotation } from '@cparra/apex-reflection/index';

export class ManifestDiff {
  added: Type[] = [];
  deleted: Type[] = [];
  changes: DiffChange[] = [];

  static build(originalManifest: Manifest, newManifest: Manifest) {
    const addedTypes = newManifest.types.filter(
      (currentType) => !originalManifest.types.find((originalType) => currentType.name === originalType.name),
    );
    const deletedTypes = originalManifest.types.filter(
      (currentType) => !newManifest.types.find((newType) => currentType.name === newType.name),
    );

    const changes: DiffChange[] = [];
    for (const newType of newManifest.types) {
      const oldType = originalManifest.types.find((oldType) => oldType.name === newType.name);
      if (!oldType) {
        continue;
      }

      const change = new DiffChange(oldType, newType);
      if (change.hasChanges()) {
        changes.push(change);
      }
    }

    const diff = new ManifestDiff();
    diff.added = addedTypes;
    diff.deleted = deletedTypes;
    diff.changes = changes;
    return diff;
  }
}

class DiffChange {
  accessModifierChange?: AccessModifierChange;
  annotationChanges: AnnotationChange[] = [];

  constructor(public originalType: Type, public newType: Type) {
    this.parse();
  }

  public hasChanges(): boolean {
    return !!this.accessModifierChange || this.annotationChanges.length > 0;
  }

  private parse() {
    // Access modifier changes
    if (this.originalType.access_modifier !== this.newType.access_modifier) {
      this.accessModifierChange = {
        oldAccessModifier: this.originalType.access_modifier,
        newAccessModifier: this.newType.access_modifier,
      };
    }

    // Annotation changes
    const addedAnnotations = this.newType.annotations.filter(
      (currentAnnotation) =>
        !this.originalType.annotations.find((originalAnnotation) => currentAnnotation.name === originalAnnotation.name),
    );
    const removedAnnotations = this.originalType.annotations.filter(
      (currentAnnotation) =>
        !this.newType.annotations.find((newAnnotation) => currentAnnotation.name === newAnnotation.name),
    );
    const annotationChangeMapper = (annotation: Annotation, changeType: 'added' | 'removed') => {
      return {
        annotation: annotation,
        type: changeType,
      } as AnnotationChange;
    };
    this.annotationChanges = [
      ...addedAnnotations.map((annotation) => {
        return annotationChangeMapper(annotation, 'added');
      }),
      ...removedAnnotations.map((annotation) => {
        return annotationChangeMapper(annotation, 'removed');
      }),
    ];
  }
}

interface AccessModifierChange {
  oldAccessModifier: string;
  newAccessModifier: string;
}

interface AnnotationChange {
  annotation: Annotation;
  type: 'added' | 'removed';
}
