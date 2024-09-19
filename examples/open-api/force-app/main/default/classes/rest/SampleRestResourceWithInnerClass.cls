/**
 * @description Contact related operations
 */
@RestResource(urlMapping='/Contact/*')
global with sharing class SampleRestResourceWithInnerClass {
    /**
     * @description This is a sample HTTP Get method
     * @return A SampleRestResourceWithInnerClass.InnerClass Object.
     * @http-response
     * statusCode: 200
     * schema: SampleRestResourceWithInnerClass.InnerClass
     */
    @HttpGet
    global static InnerClass doGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String contactId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        return new InnerClass();
    }

    global class InnerClass {
        global String stringMember;
    }
}
