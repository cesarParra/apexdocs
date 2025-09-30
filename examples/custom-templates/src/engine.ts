import Handlebars from 'handlebars';
import { Type } from '@cparra/apex-reflection';
import * as fs from 'node:fs';
import * as path from 'path';

export type Data = {
  apex: Type[];
};

export type Config = {
  templateDir: string;
  outputDir: string;
};

/**
 * This class is responsible for global concerns pertinent to all renderers. Eg, the top level data
 * structure, and template/output directories, caching templates, etc.
 */
export class Engine {
  //cached templates, unknown type should probably be something else, but i wasn't sure what
  static cachedTemplates: Map<string, HandlebarsTemplateDelegate<unknown>> = new Map();
  static cachedPartials: Set<string> = new Set();

  private static instance: Engine | null = null;

  private constructor(
    private readonly cfg: Config,
    private readonly data: Data,
  ) {}

  /**
   * Returns singleton instance. Must pass cfg & data the first time.
   */
  public static setInstance(cfg?: Config, data?: Data) {
    if (!Engine.instance) {
      if (!cfg || !data) {
        throw new Error('Engine not initialized. Must provide cfg and data on first call.');
      }
      Engine.instance = new Engine(cfg, data);
    }
  }
  /**
   * Returns singleton instance. Must pass cfg & data the first time.
   */
  public static getInstance(): Engine {
    if (!Engine.instance) {
      throw new Error('Engine not initialized. Must provide cfg and data on first call.');
    }
    return Engine.instance;
  }

  public getOutputPath(): string {
    return this.cfg.outputDir;
  }

  /**
   * Reads given file from template directory and caches handlebars function if not cached, then
   * returns the function which can be called to render content.
   * @param templateName name of template to retrieve
   * @returns Handlebars template function which can be called with data to produce content
   */
  public retrieveTemplate(templateName: string): HandlebarsTemplateDelegate<unknown> | undefined {
    if (!Engine.cachedTemplates.has(templateName)) {
      //read template file
      try {
        Engine.cachedTemplates.set(
          templateName,
          Handlebars.compile(fs.readFileSync(path.join(this.cfg.templateDir, templateName)).toString()),
        );
      } catch (err) {
        console.log('failed to read file', err);
      }
    }

    return Engine.cachedTemplates.get(templateName);
  }

  /**
   * registers partial with given name relative to template directory and caches if not cached, then
   * returns given partial name.
   * @param partialName path to handlebars template for a partial
   * @returns the same name that was passed to it
   */
  public retrievePartial(partialName: string): string | undefined {
    if (!Engine.cachedPartials.has(partialName)) {
      let templateContent;
      try {
        templateContent = fs.readFileSync(path.join(this.cfg.templateDir, partialName)).toString();
      } catch (err) {
        console.log(err);
        return;
      }

      Handlebars.registerPartial(partialName, templateContent);

      Engine.cachedPartials.add(partialName);
    }

    return partialName;
  }

  public retrieveData(): Data {
    return this.data;
  }

  public registerHelper(name: string, fn: (...args: any[]) => any) {
    Handlebars.registerHelper(name, fn);
  }
}

//----------------------------------------------------
// handlebars helpers commonly used for all bundles
//----------------------------------------------------
Handlebars.registerHelper('partial', (fileName: string) => {
  return Engine.getInstance().retrievePartial(fileName);
});

Handlebars.registerHelper('toJSON', (data: unknown) => {
  return JSON.stringify(data, null, '  ');
});

Handlebars.registerHelper('urlEncode', (url: string) => {
  return encodeURI(
    url
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''),
  );
});
