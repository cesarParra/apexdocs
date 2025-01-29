// Substitute the import location for '@cparra/apexdocs'
import { process } from '../../../dist/index.js';

const config = {
  sourceDir: 'force-app',
  targetGenerator: 'markdown',
  exclude: ['**/BaseClass.cls'],
  scope: ['global', 'public', 'private'],
};

process(config)
  .then(() => {
    console.log('Finished processing');
  })
  .catch((error) => {
    console.error(error);
  });
