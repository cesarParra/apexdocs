import { Type } from '@cparra/apex-reflection';

export class TypesRepository {
  private static instance: TypesRepository;
  private types: Type[] = [];

  public static getInstance(): TypesRepository {
    if (!TypesRepository.instance) {
      TypesRepository.instance = new TypesRepository();
    }
    return TypesRepository.instance;
  }

  public populate(types: Type[]) {
    this.types = types;
  }

  public getByName(typeName: string): Type | undefined {
    return this.types.find((currentType: Type) => currentType.name === typeName);
  }
}
