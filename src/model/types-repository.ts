import { Type } from '@cparra/apex-reflection';

export class TypesRepository {
  private static instance: TypesRepository;
  private scopedTypes: Type[] = [];
  private allTypes: Type[] = [];

  public static getInstance(): TypesRepository {
    if (!TypesRepository.instance) {
      TypesRepository.instance = new TypesRepository();
    }
    return TypesRepository.instance;
  }

  public populateAll(types: Type[]) {
    this.allTypes = types;
  }

  public getFromAllByName(typeName: string): Type | undefined {
    return this.allTypes.find((currentType: Type) => currentType.name.toLowerCase() === typeName.toLowerCase());
  }

  public populateScoped(types: Type[]) {
    this.scopedTypes = types;
  }

  public getFromScopedByName(typeName: string): Type | undefined {
    return this.scopedTypes.find((currentType: Type) => currentType.name === typeName);
  }
}
