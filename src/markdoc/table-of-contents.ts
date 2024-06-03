import { SourceFile, Manifest } from './types';

export default function tableOfContents(
  sourceManifest: Manifest,
  defaultGroupName: string,
  disableGrouping: boolean,
): string {
  return disableGrouping ? flat(sourceManifest) : grouped(sourceManifest, defaultGroupName);
}

function flat(sourceManifest: Manifest) {
  return sourceManifest.files.map((value) => apexType(value)).join('\n');
}

function grouped(sourceManifest: Manifest, defaultGroupName: string) {
  // Group by the group property and if it is not defined then name is "Miscellaneous"
  const grouped = sourceManifest.files.reduce((acc, file) => {
    const group = file.group || defaultGroupName;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(file);
    return acc;
  }, {} as Record<string, SourceFile[]>);

  return Object.entries(grouped).reduce((acc, [groupName, apexType]) => {
    return acc + title(groupName) + apexTypeList(apexType) + '\n\n';
  }, '');
}

function title(groupName: string) {
  return `## ${groupName}\n`;
}

function apexTypeList(apexTypes: SourceFile[]) {
  return apexTypes.map((value) => apexType(value)).join('\n');
}

function apexType(value: SourceFile) {
  return `- [${value.name}](${value.url})${value.description ? `\n${value.description}` : ''}`;
}
