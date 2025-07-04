# Url Clase

Represents a uniform resource locator (URL) and provides access to parts of the URL. 
Enables access to the base URL used to access your Salesforce org.

**Usage** 

Use the methods of the `System.URL` class to create links to objects in your organization. Such objects can be files, images, 
logos, or records that you want to include in external emails, in activities, or in Chatter posts. For example, you can create 
a link to a file uploaded as an attachment to a Chatter post by concatenating the Salesforce base URL with the file ID: 
 
```apex
// Get a file uploaded through Chatter.
ContentDocument doc = [SELECT Id FROM ContentDocument
        WHERE Title = 'myfile'];
// Create a link to the file.
String fullFileURL = URL.getOrgDomainURL().toExternalForm() +
        '/' + doc.id;
System.debug(fullFileURL);
```

 
The following example creates a link to a Salesforce record. The full URL is created by concatenating the Salesforce base 
URL with the record ID. 
 
```apex
Account acct = [SELECT Id FROM Account WHERE Name = 'Acme' LIMIT 1];
String fullRecordURL = URL.getOrgDomainURL().toExternalForm() + '/' + acct.Id;
```

**Version Behavior Changes** 

In API version 41.0 and later, Apex URL objects are represented by the java.net.URI type, not the java.net.URL type. 
 
The API version in which the URL object was instantiated determines the behavior of subsequent method calls to the 
specific instance. Salesforce strongly encourages you to use API 41.0 and later versions for fully RFC-compliant URL 
parsing that includes proper handling of edge cases of complex URL structures. API 41.0 and later versions also enforce 
that inputs are valid, RFC-compliant URL or URI strings. 
 
* [URL Constructors](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_methods_system_url.htm#apex_System_URL_constructors) 
* [URL Methods](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_methods_system_url.htm#apex_System_URL_methods) 
 
**See Also** 
* [URL Class](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_url.htm)

## Example
In this example, the base URL and the full request URL of the current Salesforce server instance are retrieved. Next, a URL 
pointing to a specific account object is created. Finally, components of the base and full URL are obtained. This example 
prints out all the results to the debug log output. 
 
```apex
// Create a new account called Acme that we will create a link for later.
Account myAccount = new Account(Name='Acme');
insert myAccount;

// Get the base URL.
String sfdcBaseURL = URL.getOrgDomainURL().toExternalForm();
System.debug('Base URL: ' + sfdcBaseURL );

// Get the URL for the current request.
String currentRequestURL = URL.getCurrentRequestUrl().toExternalForm();
System.debug('Current request URL: ' + currentRequestURL);

// Create the account URL from the base URL.
String accountURL = URL.getOrgDomainURL().toExternalForm() +
                       '/' + myAccount.Id;
System.debug('URL of a particular account: ' + accountURL);

// Get some parts of the base URL.
System.debug('Host: ' + URL.getOrgDomainURL().getHost());
System.debug('Protocol: ' + URL.getOrgDomainURL().getProtocol());

// Get the query string of the current request.
System.debug('Query: ' + URL.getCurrentRequestUrl().getQuery());
```

## Constructores
### `Url(spec)`

Creates a new instance of the URL class using the specified string representation of the URL.

#### Firma
```apex
global Url(String spec)
```

#### Parámetros
| Name | Type | Description |
|------|------|-------------|
| spec | String | The string to parse as a URL. |

---

### `Url(context, spec)`

Creates a new instance of the URL class by parsing the specified spec within the specified context.

**Usage** 

The new URL is created from the given context URL and the spec argument as described in RFC2396 &quot;Uniform Resource Identifiers : Generic * Syntax&quot; : 
```xml
<scheme>://<authority><path>?<query>#<fragment>
```

 
For more information about the arguments of this constructor, see the corresponding URL(java.net.URL, java.lang.String) constructor for Java.

#### Firma
```apex
global Url(Url context, String spec)
```

#### Parámetros
| Name | Type | Description |
|------|------|-------------|
| context | [Url](Url.md) | The context in which to parse the specification. |
| spec | String | The string to parse as a URL. |

---

### `Url(protocol, host, file)`

Creates a new instance of the URL class using the specified protocol, host, and file on the host. The default port for the specified protocol is used.

#### Firma
```apex
global Url(String protocol, String host, String file)
```

#### Parámetros
| Name | Type | Description |
|------|------|-------------|
| protocol | String | The protocol name for this URL. |
| host | String | The host name for this URL. |
| file | String | The file name for this URL. |

---

### `Url(protocol, host, port, file)`

Creates a new instance of the URL class using the specified protocol, host, port number, and file on the host.

#### Firma
```apex
global Url(String protocol, String host, Integer port, String file)
```

#### Parámetros
| Name | Type | Description |
|------|------|-------------|
| protocol | String | The protocol name for this URL. |
| host | String | The host name for this URL. |
| port | Integer | The port number for this URL. |
| file | String | The file name for this URL. |

## Métodos
### `getAuthority()`

Returns the authority portion of the current URL.

#### Firma
```apex
global String getAuthority()
```

#### Tipo de Retorno
**String**

The authority portion of the current URL.

---

### `getCurrentRequestUrl()`

Returns the URL of an entire request on a Salesforce instance.

**Usage** 

An example of a URL for an entire request is https://yourInstance.salesforce.com/apex/myVfPage.apexp.

#### Firma
```apex
global static Url getCurrentRequestUrl()
```

#### Tipo de Retorno
**[Url](Url.md)**

The URL of the entire request.

---

### `getDefPort()`

Returns the default port number of the protocol associated with the current URL.

**Usage** 

Returns -1 if the URL scheme or the stream protocol handler for the URL doesn&#x27;t define a default port number.

#### Firma
```apex
global Integer getDefPort()
```

#### Tipo de Retorno
**Integer**

The default port number of the protocol associated with the current URL.

---

### `getFile()`

Returns the file name of the current URL.

#### Firma
```apex
global String getFile()
```

#### Tipo de Retorno
**String**

The file name of the current URL.

---

### `getFileFieldURL(entityId, fieldName)`

Returns the download URL for a file attachment.

#### Firma
```apex
global static String getFileFieldURL(String entityId, String fieldName)
```

#### Parámetros
| Name | Type | Description |
|------|------|-------------|
| entityId | String | Specifies the ID of the entity that holds the file data. |
| fieldName | String | Specifies the API name of a file field component, such as `AttachmentBody` . |

#### Tipo de Retorno
**String**

The download URL for the file attachment.

#### Example
String fileURL &#x3D; 
URL.getFileFieldURL( 
&#x27;087000000000123&#x27; , 
&#x27;AttachmentBody&#x27;);

---

### `getHost()`

Returns the host name of the current URL.

#### Firma
```apex
global String getHost()
```

#### Tipo de Retorno
**String**

The host name of the current URL.

---

### `getOrgDomainUrl()`

Returns the canonical URL for your org. For example, https://MyDomainName.my.salesforce.com.

**Usage** 

Use getOrgDomainUrl() to interact with Salesforce REST and SOAP APIs in Apex code. Get endpoints for User Interface API calls, for creating and customizing picklist value sets and custom fields, and more. 
 
 `getOrgDomainUrl()` can access the domain URL only for the org in which the Apex code is running. 
 
You don&#x27;t need a RemoteSiteSetting for your org to interact with the Salesforce APIs using domain URLs retrieved with this method.

**See Also** 

* [Lightning Aura Components Developer Guide: Making API Calls from Apex](https://developer.salesforce.com/docs/atlas.en-us.250.0.lightning.meta/lightning/apex_api_calls.htm)

#### Firma
```apex
global static Url getOrgDomainUrl()
```

#### Tipo de Retorno
**[Url](Url.md)**

getOrgDomainUrl() always returns the login URL for your org, regardless of context. Use that URL when making API calls to your org.

#### Example
This example uses the Salesforce REST API to get organization limit values. For information on limits, see Limits in the REST API Developer Guide. 
 
```apex
Http h = new Http();
HttpRequest req = new HttpRequest();
req.setEndpoint(Url.getOrgDomainUrl().toExternalForm()
   + '/services/data/v44.0/limits');
req.setMethod('GET');
req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
HttpResponse res = h.send(req);
```