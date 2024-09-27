import { extractArgs } from '../args';
import { assertEither } from '../../core/test-helpers/assert-either';
import {
  UserDefinedChangelogConfig,
  UserDefinedMarkdownConfig,
  UserDefinedOpenApiConfig,
} from '../../core/shared/types';

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

    it('extracts the arguments from the process for the openapi command', async () => {
      function getFromProcess() {
        return ['openapi', '--sourceDir', 'force-app'];
      }

      const result = await extractArgs(getFromProcess);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(1);
        expect(configs[0].targetGenerator).toEqual('openapi');

        const openApiConfig = configs[0] as UserDefinedOpenApiConfig;
        expect(openApiConfig.sourceDir).toEqual('force-app');
      });
    });

    it('extracts the arguments from the process for the changelog command', async () => {
      function getFromProcess() {
        return ['changelog', '--previousVersionDir', 'previous', '--currentVersionDir', 'force-app'];
      }

      const result = await extractArgs(getFromProcess);

      assertEither(result, (configs) => {
        expect(configs).toHaveLength(1);
        expect(configs[0].targetGenerator).toEqual('changelog');

        const changelogConfig = configs[0] as UserDefinedChangelogConfig;

        expect(changelogConfig.previousVersionDir).toEqual('previous');
        expect(changelogConfig.currentVersionDir).toEqual('force-app');
      });
    });
  });
});

// TODO: Console errors when the command is not provided