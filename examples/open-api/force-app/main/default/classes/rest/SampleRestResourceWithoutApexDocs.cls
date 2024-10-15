/**
 * @description Order related operations
 */
@RestResource(UrlMapping='/Order/*')
global with sharing class SampleRestResourceWithoutApexDocs {
    @HttpGet
    global static String doGet(String param1, Reference1 param2) {
        return 'Hello World!';
    }

    @HttpPatch
    global static String doPatch(String param1, Reference1 param2) {
        return 'Hello World!';
    }
}
