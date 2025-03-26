export class TriggerBuilder {
  name: string = 'MyFirstTrigger';
  objectName: string = 'Account';
  events: string[] = ['before insert'];

  withName(name: string): TriggerBuilder {
    this.name = name;
    return this;
  }

  withObjectName(objectName: string): TriggerBuilder {
    this.objectName = objectName;
    return this;
  }

  withEvents(events: string[]): TriggerBuilder {
    this.events = events;
    return this;
  }

  build(): string {
    return `
    trigger ${this.name} on ${this.objectName} (${this.events.join(', ')}) {}`;
  }
}
