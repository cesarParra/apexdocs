import Bundle from './src/bundles/bundle';
import DefaultBundle from './src/bundles/default/default';
import { Engine } from './src/engine';
import { Renderer } from './src/renderer';
import { Loader } from './src/viewData/loader';

//load data from force-app dir (this is already done in the main source, so can be mostly ignored)
const loader = new Loader('force-app');

//transform loaded data to types useful for rendering files
const data = loader.compileData();

//pass config and data to singleton engine instance. These already exist in the existing config
Engine.setInstance({ templateDir: 'templates', outputDir: 'docs' }, data);

//determine which bundle to use for rendering. This would be configured by the consumer.
const db: Bundle = new DefaultBundle();

//add a custom supplimental renderer not included in the bundle, this would be something that can
//be manually configured by the consumer.
db.addRenderer(
  new Renderer({
    fileName: () => `index.md`,
    template: 'index.hbr',
  }),
);

db.registerHelper('showMyText', () => 'Hi mom!');

//execute the bundle rendering
db.renderAll();

/**
 * This entire example could be integrated to the existing config like this:
 *
 * ...
 *
 * export default {
 *   markdown: defineMarkdownConfig({
 *     sourceDir: 'force-app',
 *     targetDir: 'docs',
 *     templateDir: 'templates',
 *     rendererBundle: 'default',
 *     customRenderers: [
 *       new Renderer({
 *         fileName: () => `index.md`,
 *         template: 'index.hbr'
 *       })
 *     ],
 *     customHelpers: {
 *       'showMyText': () => 'Hi mom!'
 *     }
 *   })
 * }
 *
 * ...
 */
