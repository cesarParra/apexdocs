// Singleton that keeps record of the generated references so far
export class ReferenceRepository {
  private static instance: ReferenceRepository;
  private readonly references: string[];

  private constructor() {
    this.references = [];
  }

  public static getInstance(): ReferenceRepository {
    if (!ReferenceRepository.instance) {
      ReferenceRepository.instance = new ReferenceRepository();
    }
    return ReferenceRepository.instance;
  }

  public logReference(typeName: string): void {
    this.references.push(typeName);
  }

  public hasReference(typeName: string): boolean {
    return this.references.includes(typeName);
  }
}

export type ReferencePair = {
  typeName: string;
  referencePath?: string;
};
