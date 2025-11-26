import { Engine, Data } from './engine';
import * as fs from 'node:fs';
import path from 'node:path';

/**
 * This type is passed to a renderer and determines how the renderer will function.
 * It defines, the data which will be passed to the template, the name (including path)
 * that will be used in the gnereated file, and the specific template that is to be used
 */
export type Config = {
  viewData?: (data: Data) => unknown[] | unknown;
  fileName: (propData: unknown, data: object) => string;
  template: string;
};

/**
 * This class is responsible for rendering a file. The constructor accepts a config which describes
 * how the data is presented to the template.
 */
export class Renderer {
  private cfg: Config;
  private engine: Engine;

  public constructor(cfg: Config) {
    this.cfg = cfg;
    this.engine = Engine.getInstance();
  }

  /**
   * Handles writing a file to disk.
   */
  public render() {
    //retrieve template from engine
    const template = this.engine.retrieveTemplate(this.cfg.template);

    if (template === undefined) {
      return;
    }

    //select data to pass to template from configured function if set, else set to top level data structure
    const selectedData = this.cfg.viewData ? this.cfg.viewData(this.engine.retrieveData()) : this.engine.retrieveData();

    if (Array.isArray(selectedData)) {
      //if selected data is array, write files with datat from each element
      selectedData.forEach((propData: unknown) => {
        const compiledStr = template(propData);

        try {
          fs.writeFileSync(
            path.join(this.engine.getOutputPath(), this.cfg.fileName(propData, this.engine.retrieveData())),
            compiledStr,
          );
        } catch (err) {
          // TODO: handle this
          console.log(err);
        }
      });
    } else {
      // if not array, write single file with top selected data
      const compiledStr = template(selectedData);

      try {
        fs.writeFileSync(
          path.join(this.engine.getOutputPath(), this.cfg.fileName(selectedData, this.engine.retrieveData())),
          compiledStr,
        );
      } catch (err) {
        // TODO: handle this
        console.log(err);
      }
    }
  }
}
