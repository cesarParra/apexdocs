export default class Scope {
  private static instance: Scope;

  private desiredScope: string[] = ['global', 'public'];

  private constructor() {}

  static getInstance(): Scope {
    if (!Scope.instance) {
      Scope.instance = new Scope();
    }

    return Scope.instance;
  }

  set(desiredScope: string[]) {
    this.desiredScope = desiredScope;
  }

  get() {
    return this.desiredScope;
  }
}
