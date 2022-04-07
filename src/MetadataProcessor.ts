import {XMLParser} from 'fast-xml-parser'

export default class MetadataProcessor{

    public static process(input : string){
        let map = new Map<string, string>();
        let xml = new XMLParser().parse(input);

        let apiVersion = xml.ApexClass.apiVersion;
        map.set('apiVersion',apiVersion !== null ? apiVersion : '');

        let status = xml.ApexClass.status;
        map.set('status',status !== null ? status : '');
        return map;
    }
}