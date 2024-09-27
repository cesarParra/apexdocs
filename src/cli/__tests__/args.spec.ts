import { extractArgs } from '../args';
import { assertEither } from '../../core/test-helpers/assert-either';
import { UserDefinedMarkdownConfig } from '../../core/shared/types';

describe('when extracting arguments', () => {
  describe('and no configuration is provided', () => {
    it('extracts the arguments from the process for the markdown command', async () => {
      function getFromProcess() {
        return ['markdown', '--sourceDir', 'force-app'];
      }

      const result = await extractArgs(getFromProcess);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(1);
        expect(configs[0].targetGenerator).toEqual('markdown');

        const markdownConfig = configs[0] as UserDefinedMarkdownConfig;
        expect(markdownConfig.sourceDir).toEqual('force-app');
      });
    });
  });
});
