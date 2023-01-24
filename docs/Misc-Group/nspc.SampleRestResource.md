# nspc.SampleRestResource

`RESTRESOURCE`

Account related operations

## Methods
### `static doDelete()`

`HTTPDELETE`

Sample HTTP Delete method with references to other types.


**Http Parameter** name: limit in: header required: true description: My sample description. schema: SampleClass


**Http Response** statusCode: 200 schema: SampleClass


**Http Response** statusCode: 500 schema: SampleClass


**Http Response** statusCode: 304 schema: ChildClass


**Http Response** statusCode: 305 schema: Reference1


**Http Response** statusCode: 306 schema: List&lt;Reference1&gt;


**Http Response** statusCode: 307 schema: Reference7[untypedObject:Reference2]

### `static doGet()`

`HTTPGET`

This is a sample HTTP Get method

#### Return

**Type**

Account

**Description**

An Account SObject.


**Http Parameter** name: limit in: query required: true description: Limits the number of items on a page schema:   type: integer


**Http Parameter** name: complex in: cookie description: A more complex schema schema:   type: array   items:     type: object     properties:       name:         type: string


**Http Response** statusCode: 200 schema:   type: object   properties:     id:       type: string       description: The super Id.     name:       type: string     phone:       type: string       format: byte


**Http Response** statusCode: 500 schema:   type: string


**Http Response** statusCode: 304 schema:   type: object   properties:     error:       type: string


**Http Response** statusCode: 400 schema:   type: array   items:     type: object     properties:       name:         type: string


**Http Response** statusCode: 100 schema:   type: object   properties:     anotherObject:       description: An object inside of an object       type: object       properties:         message:           type: string         somethingElse:           type: number

### `static doPost(String name, String phone, String website)`

`HTTPPOST`

This is a sample HTTP Post method

#### Return

**Type**

String

**Description**

A String SObject.


**Summary** Posts an Account 2


**Http Parameter** name: limit in: query required: true description: Limits the number of items on a page schema:   type: integer


**Http Parameter** name: complex in: cookie description: A more complex schema schema:   type: array   items:     type: object     properties:       name:         type: string


**Http Request Body** description: This is an example of a request body required: true schema:   type: array   items:     type: object     properties:       name:         type: string


**Http Response** statusCode: 200 schema:   type: object   properties:     id:       type: string       description: The super Id.     name:       type: string     phone:       type: string       format: byte


**Http Response** statusCode: 500 schema:   type: string


**Http Response** statusCode: 304 schema:   type: object   properties:     error:       type: string


**Http Response** statusCode: 400 schema:   type: array   items:     type: object     properties:       name:         type: string

---
