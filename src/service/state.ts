import { Type } from '@cparra/apex-reflection';

export default class State {
  private static instance: State;
  private typeBeingProcessed?: Type;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): State {
    if (!State.instance) {
      State.instance = new State();
    }
    return State.instance;
  }

  public setTypeBeingProcessed(typeToSet: Type): void {
    this.typeBeingProcessed = typeToSet;
  }

  public getTypeBeingProcessed(): Type | undefined {
    return this.typeBeingProcessed;
  }
}
