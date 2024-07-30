import { OpenApi } from '../open-api';

it('should get created with a title and a version', function () {
  const openApi = new OpenApi('Test Spec', '1.0.0');

  expect(openApi.info.title).toBe('Test Spec');
  expect(openApi.info.version).toBe('1.0.0');
});

it('should contain a single server, which points to the correct server URL', function () {
  const openApi = new OpenApi('Test Spec', '1.0.0');

  expect(openApi.servers.length).toBe(1);
  expect(openApi.servers[0].url).toBe('/services/apexrest/');
});

it('should optionally allow for a namespace to be passed in as part of the server', function () {
  const openApi = new OpenApi('Test Spec', '1.0.0', 'Namespace');

  expect(openApi.servers.length).toBe(1);
  expect(openApi.servers[0].url).toBe('/services/apexrest/Namespace/');
});
