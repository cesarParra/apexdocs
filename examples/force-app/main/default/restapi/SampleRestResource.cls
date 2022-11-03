/**
 * @description Account related operations.
 */
@RestResource(urlMapping='/Account/*')
global with sharing class SampleRestResource {
    /**
     * @description Sample HTTP Delete method with references to other types.
     * @http-parameter
     * name: limit
     * in: cookie
     * required: true
     * description: My sample description.
     * schema: SampleClass
     */
    @HttpDelete
    global static void doDelete() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String accountId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        Account account = [SELECT Id FROM Account WHERE Id = :accountId];
        delete account;
    }

    /**
     * @description This is a sample HTTP Get method
     * @return An Account SObject.
     * @http-parameter
     * name: limit
     * in: query
     * required: true
     * description: Limits the number of items on a page
     * schema:
     *   type: integer
     * @http-parameter
     * name: complex
     * in: cookie
     * description: A more complex schema
     * schema:
     *   type: array
     *   items:
     *     type: object
     *     properties:
     *       name:
     *         type: string
     * @http-response
     * statusCode: 200
     * type: object
     * properties:
     *   id:
     *     type: string
     *     description: The super Id.
     *   name:
     *     type: string
     *   phone:
     *     type: string
     *     format: byte
     * @http-response
     * statusCode: 500
     * type: string
     * @http-response
     * statusCode: 304
     * type: object
     * properties:
     *   error:
     *     type: string
     * @http-response
     * statusCode: 400
     * type: array
     * items:
     *   type: object
     *   properties:
     *     name:
     *       type: string
     */
    @HttpGet
    global static Account doGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String accountId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        Account result = [SELECT Id, Name, Phone, Website FROM Account WHERE Id = :accountId];
        return result;
    }

    /**
     * @description This is a sample HTTP Post method
     * @return A String SObject.
     * @http-parameter
     * name: limit
     * in: query
     * required: true
     * description: Limits the number of items on a page
     * schema:
     *   type: integer
     * @http-parameter
     * name: complex
     * in: cookie
     * description: A more complex schema
     * schema:
     *   type: array
     *   items:
     *     type: object
     *     properties:
     *       name:
     *         type: string
     * @http-request-body
     * description: This is an example of a request body
     * required: true
     * schema:
     *   type: array
     *   items:
     *     type: object
     *     properties:
     *       name:
     *         type: string
     * @http-response
     * statusCode: 200
     * type: object
     * properties:
     *   id:
     *     type: string
     *     description: The super Id.
     *   name:
     *     type: string
     *   phone:
     *     type: string
     *     format: byte
     * @http-response
     * statusCode: 500
     * type: string
     * @http-response
     * statusCode: 304
     * type: object
     * properties:
     *   error:
     *     type: string
     * @http-response
     * statusCode: 400
     * type: array
     * items:
     *   type: object
     *   properties:
     *     name:
     *       type: string
     */
    @HttpPost
    global static String doPost(String name,
        String phone, String website) {
        Account account = new Account();
        account.Name = name;
        account.phone = phone;
        account.website = website;
        insert account;
        return account.Id;
    }
}