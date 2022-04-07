import { XMLParser } from 'fast-xml-parser';

export default class MetadataProcessor {
  public static process(input: string) {
    const map = new Map<string, string>();
    const xml = new XMLParser().parse(input);

    const apiVersion = xml.ApexClass.apiVersion;
    map.set('apiVersion', apiVersion !== null ? apiVersion : '');

    const status = xml.ApexClass.status;
    map.set('status', status !== null ? status : '');
    return map;
  }
}
