import { ResponsesBuilder } from '../ResponsesBuilder';
import { Reference } from '../ReferenceBuilder';
import { ApexDocHttpResponse } from '../../../../core/openapi/apex-doc-types';

jest.mock('../ReferenceBuilder', () => {
  return {
    ReferenceBuilder: jest.fn().mockImplementation(() => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        build: (): Reference => {
          return {
            referenceComponents: [
              {
                referencedClass: 'MySampleClass',
                schema: {
                  type: 'string',
                },
              },
            ],
            entrypointReferenceObject: {
              $ref: '/mySampleClass',
            },
          };
        },
      };
    }),
  };
});

it('should build a ResponseObject based on the received schema', function () {
  const apexDocResponse: ApexDocHttpResponse = {
    statusCode: 200,
    schema: {
      type: 'string',
    },
  };

  const response = new ResponsesBuilder().build(apexDocResponse);

  expect(response.reference).toBeUndefined();
  expect(response.body.description).toContain('200');
  expect(response.body.content).toHaveProperty('application/json');
  expect(response.body.content!['application/json'].schema).toBe(apexDocResponse.schema);
});

it('should build a ResponseObject with a reference', function () {
  const apexDocResponse: ApexDocHttpResponse = {
    statusCode: 200,
    schema: 'SomeClass',
  };

  const response = new ResponsesBuilder().build(apexDocResponse);

  expect(response.reference).not.toBeUndefined();
});
