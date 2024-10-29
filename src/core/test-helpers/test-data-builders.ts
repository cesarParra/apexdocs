export function customObjectGenerator(
  config: { deploymentStatus: string; visibility: string } = { deploymentStatus: 'Deployed', visibility: 'Public' },
) {
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>${config.deploymentStatus}</deploymentStatus>
        <description>test object for testing</description>
        <label>MyTestObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
        <visibility>${config.visibility}</visibility>
    </CustomObject>`;
}
