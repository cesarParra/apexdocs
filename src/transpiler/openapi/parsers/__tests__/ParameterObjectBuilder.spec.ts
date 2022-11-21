import { ParameterObjectBuilder } from '../ParameterObjectBuilder';
import { Reference } from '../ReferenceBuilder';
import { ReferenceObject } from '../../../../model/openapi/open-api-types';
import { ApexDocParameterObject } from '../../../../model/openapi/apex-doc-types';

jest.mock('../ReferenceBuilder', () => {
  return {
    ReferenceBuilder: jest.fn().mockImplementation(() => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        build: (): Reference => {
          return {
            referencedClass: 'MySampleClass',
            referenceObject: {
              $ref: '/mySampleClass',
            },
            schema: {
              type: 'string',
            },
          };
        },
      };
    }),
  };
});

it('should build a ParameterObject based on the received schema', function () {
  const apexDocParameter: ApexDocParameterObject = {
    name: 'limit',
    in: 'query',
    description: 'Sample description',
    required: true,
    schema: {
      type: 'string',
    },
  };

  const response = new ParameterObjectBuilder().build(apexDocParameter);

  expect(response.reference).toBeUndefined();
  expect(response.parameterObject.name).toBe('limit');
  expect(response.parameterObject.in).toBe('query');
  expect(response.parameterObject.description).toBe('Sample description');
  expect(response.parameterObject.required).toBe(true);
  expect(response.parameterObject.schema).toBe(apexDocParameter.schema);
});

it('should build a ParameterObject with a reference when referencing a different class', function () {
  const apexDocParameter: ApexDocParameterObject = {
    name: 'limit',
    in: 'query',
    description: 'Sample description',
    required: true,
    schema: 'SomeClass',
  };

  const response = new ParameterObjectBuilder().build(apexDocParameter);

  expect(response.reference).not.toBeUndefined();
  expect(response.parameterObject.name).toBe('limit');
  expect(response.parameterObject.in).toBe('query');
  expect(response.parameterObject.description).toBe('Sample description');
  expect(response.parameterObject.required).toBe(true);
  expect((response.parameterObject.schema as ReferenceObject).$ref).toBe('/mySampleClass');
});
