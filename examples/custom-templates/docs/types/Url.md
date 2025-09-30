# Url
Represents a uniform resource locator (URL) and provides access to parts of the URL.
Enables access to the base URL used to access your Salesforce org.

## Usage
Use the methods of the &#x60;System.URL&#x60; class to create links to objects in your organization. Such objects can be files, images,
logos, or records that you want to include in external emails, in activities, or in Chatter posts. For example, you can create
a link to a file uploaded as an attachment to a Chatter post by concatenating the Salesforce base URL with the file ID:

&#x60;&#x60;&#x60;apex
// Get a file uploaded through Chatter.
ContentDocument doc &#x3D; [SELECT Id FROM ContentDocument
        WHERE Title &#x3D; &#x27;myfile&#x27;];
// Create a link to the file.
String fullFileURL &#x3D; URL.getOrgDomainURL().toExternalForm() +
&#x27;/&#x27; + doc.id;
system.debug(fullFileURL);
&#x60;&#x60;&#x60;

The following example creates a link to a Salesforce record. The full URL is created by concatenating the Salesforce base
URL with the record ID.

&#x60;&#x60;&#x60;ape
Account acct &#x3D; [SELECT Id FROM Account WHERE Name &#x3D; &#x27;Acme&#x27; LIMIT 1];
String fullRecordURL &#x3D; URL.getOrgDomainURL().toExternalForm() + &#x27;/&#x27; + acct.Id;
&#x60;&#x60;&#x60;

## Example
In this example, the base URL and the full request URL of the current Salesforce server instance are retrieved. Next, a URL
pointing to a specific account object is created. Finally, components of the base and full URL are obtained. This example
prints out all the results to the debug log output.

&#x60;&#x60;&#x60;apex
// Create a new account called Acme that we will create a link for later.
Account myAccount &#x3D; new Account(Name&#x3D;&#x27;Acme&#x27;);
insert myAccount;

// Get the base URL.
String sfdcBaseURL &#x3D; URL.getOrgDomainURL().toExternalForm();
System.debug(&#x27;Base URL: &#x27; + sfdcBaseURL );

// Get the URL for the current request.
String currentRequestURL &#x3D; URL.getCurrentRequestUrl().toExternalForm();
System.debug(&#x27;Current request URL: &#x27; + currentRequestURL);

// Create the account URL from the base URL.
String accountURL &#x3D; URL.getOrgDomainURL().toExternalForm() +
                       &#x27;/&#x27; + myAccount.Id;
System.debug(&#x27;URL of a particular account: &#x27; + accountURL);

// Get some parts of the base URL.
System.debug(&#x27;Host: &#x27; + URL.getOrgDomainURL().getHost());
System.debug(&#x27;Protocol: &#x27; + URL.getOrgDomainURL().getProtocol());

// Get the query string of the current request.
System.debug(&#x27;Query: &#x27; + URL.getCurrentRequestUrl().getQuery());
&#x60;&#x60;&#x60;

## Version Behavior Changes
In API version 41.0 and later, Apex URL objects are represented by the java.net.URI type, not the java.net.URL type.
The API version in which the URL object was instantiated determines the behavior of subsequent method calls to the
specific instance. Salesforce strongly encourages you to use API 41.0 and later versions for fully RFC-compliant URL
parsing that includes proper handling of edge cases of complex URL structures. API 41.0 and later versions also enforce
that inputs are valid, RFC-compliant URL or URI strings.

* [URL Constructors](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_methods_system_url.htm#apex_System_URL_constructors)
* [URL Methods](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_methods_system_url.htm#apex_System_URL_methods)

**See Also**
* [URL Class](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_url.htm)

## Methods

### Summary
  
  - [getAuthority()](#getauthority): Returns the authority portion of the current URL.

  - [getCurrentRequestUrl()](#getcurrentrequesturl): Returns the URL of an entire request on a Salesforce instance.

  - [getDefPort()](#getdefport): Returns the default port number of the protocol associated with the current URL.

  - [getFile()](#getfile): Returns the file name of the current URL.

  - [getFileFieldURL(String, String)](#getfilefieldurlstring-string): Returns the download URL for a file attachment.

  - [getHost()](#gethost): Returns the host name of the current URL.

  - [getOrgDomainUrl()](#getorgdomainurl): Returns the canonical URL for your org. For example, https://MyDomainName.my.salesforce.com.

### getAuthority()

Returns the authority portion of the current URL.

access: global

return: String

### getCurrentRequestUrl()

Returns the URL of an entire request on a Salesforce instance.

access: global

return: Url

### getDefPort()

Returns the default port number of the protocol associated with the current URL.

access: global

return: Integer

### getFile()

Returns the file name of the current URL.

access: global

return: String

### getFileFieldURL(String, String)

Returns the download URL for a file attachment.

access: global

return: String

### getHost()

Returns the host name of the current URL.

access: global

return: String

### getOrgDomainUrl()

Returns the canonical URL for your org. For example, https://MyDomainName.my.salesforce.com.

access: global

return: Url


[home](../index.md)