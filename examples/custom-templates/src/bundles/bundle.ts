import { Engine } from '../engine';
import { Renderer } from '../renderer';

export default abstract class Bundle {
  private renderers: Renderer[];

  constructor(renderers: Renderer[]) {
    this.renderers = renderers;
  }

  public registerHelper(name: string, fn: (...args: any[]) => any) {
    Engine.getInstance().registerHelper(name, fn);
  }

  public addRenderer(renderer: Renderer): void {
    this.renderers.push(renderer);
  }

  public renderAll(): void {
    this.renderers.forEach((r) => r.render());
  }
}
