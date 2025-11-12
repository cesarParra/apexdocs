/**
 * This is an example of how a bundle implementation could look.
 */
import { Data } from '../../engine';
import { Renderer } from '../../renderer';
import Bundle from '../bundle';

/**
 * This is how a default renderer bundle
 */
export default class DefaultBundle extends Bundle {
  constructor() {
    const renderers: Renderer[] = [
      new Renderer({
        // renderer for top level data json file. This is very useful for debugging.
        fileName: () => 'data.json',
        template: 'data.hbr',
      }),
      new Renderer({
        //renderer for apex classes
        viewData: (data: Data) => data.apex.filter((element) => element.type_name === 'class'),
        fileName: (viewData: unknown) => `types/${(viewData as { name: string }).name}.md`,
        template: 'class.hbr',
      }),
    ];

    // custom helper methods specific to something this bundle does, these can be referenced as
    // functions within templates, see index.md
    super(renderers);
    super.registerHelper('makeHeader', (str: string) => `# ${str}`);
  }
}
