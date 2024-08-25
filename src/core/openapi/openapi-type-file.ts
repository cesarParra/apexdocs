import { OpenApi } from './open-api';
import { OpenApiPageData } from '../shared/types';

export function createOpenApiFile(fileName: string, openApiModel: OpenApi): OpenApiPageData {
  const content = JSON.stringify({ ...openApiModel, namespace: undefined }, null, 2);
  return {
    outputDocPath: `${fileName}.json`,
    content,
    frontmatter: null,
    group: null,
  };
}
