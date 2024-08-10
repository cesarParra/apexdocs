---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Apexdocs Vitepress Example"
  text: "API Documentation"
  tagline: My great project tagline
  actions:
    - theme: brand
      text: Markdown Examples
      link: /markdown-examples
    - theme: alt
      text: API Examples
      link: /api-examples
---

# Apex Reference Guide

## Miscellaneous

### [apexdocs.BaseClass](./Miscellaneous/apexdocs.BaseClass.md)

### [apexdocs.MultiInheritanceClass](./Miscellaneous/apexdocs.MultiInheritanceClass.md)

### [apexdocs.ParentInterface](./Miscellaneous/apexdocs.ParentInterface.md)

### [apexdocs.ReferencedEnum](./Miscellaneous/apexdocs.ReferencedEnum.md)

### [apexdocs.SampleEnum](./Miscellaneous/apexdocs.SampleEnum.md)

### [apexdocs.SampleException](./Miscellaneous/apexdocs.SampleException.md)

### [apexdocs.SampleInterface](./Miscellaneous/apexdocs.SampleInterface.md)

This is a sample interface

### [apexdocs.Url](./Miscellaneous/apexdocs.Url.md)

Represents a uniform resource locator (URL) and provides access to parts of the URL. 
Enables access to the base URL used to access your Salesforce org. 
 
## Usage 
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

## SampleGroup

### [apexdocs.SampleClass](./SampleGroup/apexdocs.SampleClass.md)

aliquip ex sunt officia ullamco anim deserunt magna aliquip nisi eiusmod in sit officia veniam ex 
deserunt ea officia exercitation laboris enim in duis quis enim eiusmod eu amet cupidatat.