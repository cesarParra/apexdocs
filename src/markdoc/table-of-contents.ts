import { ApexType, SourceManifest } from './types';

export default function tableOfContents(sourceManifest: SourceManifest): string {
  return Object.entries(sourceManifest).reduce((acc, [groupName, apexType]) => {
    return acc + title(groupName) + apexTypeList(apexType) + '\n\n';
  }, '');
}

function title(groupName: string) {
  return `## ${groupName}\n`;
}

function apexTypeList(apexTypes: ApexType[]) {
  return apexTypes.map((value) => apexType(value)).join('\n');
}

function apexType(value: ApexType) {
  return `- [${value.name}](${value.url})${value.description ? `\n${value.description}` : ''}`;
}
