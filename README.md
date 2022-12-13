# ApexDocs

<p align="center">
  <b>ApexDocs is a Node.js library with CLI capabilities to docGenerator documentation for Salesforce Apex classes.</b>
</p>

[![License](https://img.shields.io/github/license/cesarParra/apexdocs)](https://github.com/cesarParra/apexdocs/blob/master/LICENSE)

## Description

ApexDocs was originally built as an alternative to
the [Java based ApexDoc tool](https://github.com/SalesforceFoundation/ApexDoc) originally created by Aslam Bari and
later maintained by Salesforce.org, as that tool is no longer being maintained.

ApexDocs is a Node.js library built on Typescript and hosted on [npm](https://www.npmjs.com/package/@cparra/apexdocs).
It offers CLI capabilities to automatically docGenerator a set of files that fully document each one of you classes.
Additionally, it can be imported and consumed directly by your JavaScript code.

There are some key differences between ApexDocs and the Java based ApexDoc tool:

- **Recursive file search through your module directory structure**. In an `sfdx` based project, all of your classes
  will be documented by specifying the top-most directory where file search should begin.
- **Unopinionated documentation site generation**. Instead of creating HTML files, ApexDocs generates a Markdown (.md)
  file per Apex class being documented. This means you can host your files in static web hosting services that parse
  Markdown like Github Pages or Netlify, and use site generators like Jekyll or Gatsby. This gives you the freedom to
  decide how to style your site to match your needs.

## Version 2.X

Version shares almost* all the same functionality (and more) of 1.X , but is a rewrite from the ground up of the tool,
so please be aware if migrating from a 1.X version.

The Apex code parsing logic for the 1.X codebase was almost a one-to-one translation of the Java based ApexDoc tool to
Javascript. With 2.X the parsing logic has been improved and extracted out of this codebase, and into its own standalone
NPM module which is solely focused on Apex code reflection: https://www.npmjs.com/package/@cparra/apex-reflection

This allows for an improved code quality of both code bases and an increased ease of introducing future improvements and
fixing issues.

### Differences between the versions

When migrating from 1.X please be aware of these changes between the major versions:

#### Deprecated features

* The `--group` CLI parameter has been deprecated. All files are grouped by default.

#### Features from 1.X not supported in 2.X

* The `--configPath` CLI parameter has been temporarily deprecated. We are planning on reintroducing it but the config
  file will use a different format.

#### New features

* All Apex annotations are now supported through the `--scope` CLI parameter, not just `namespaceaccessible`. This means
  that scopes like `auraenabled`, `invocablemethod`, `invocablevariable`, `remoteaction`, and all other valid Apex
  annotations are supported.
* Just like Javadoc, both `@throws` and `@exception` are supported when referencing an exception thrown by a method or
  constructor.
* Any custom annotation defined in the Apexdoc is at the class level are supported, for example the following will be
  output to the resulting markdown file:

```apex
/**
 * @MyCustomAnnotation This is a custom annotation
 */
public class MyClass {
}
```

* Apex docs blocks can now all be in a single line
* Support for grouping blocks of related code within a class
* Support for HTML tags
* And more!

### Demo

ApexDocs currently supports generating markdown files for Jekyll and Docsify sites, as well as generating plain markdown
files.

### In the wild

- [Nimble AMS Docs](https://nimbleuser.github.io/nams-api-docs/#/api-reference/)
- [Yet Another Salesforce Logger](https://cesarparra.github.io/yet-another-salesforce-logger/#/)

### [Docsify](https://docsify.js.org/)

Demo

- [Docsify](https://cesarparra.github.io/apexdocs/)

### [Jekyll](https://jekyllrb.com/)

Demo

- [Jekyll](https://cesarparra.github.io/apexdocs-docsify-example/)

## Installation

```bash
npm i -g @cparra/apexdocs
```

## Usage

### CLI

```bash
apexdocs-generate
    -s src
    -t docs
    -p global
    -g docsify
```

The CLI supports the following parameters:

| Parameter          | Alias | Description                                                                                                                                                                                                                                                                                                                                                                 | Default         | Required |
|--------------------|-------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|----------|
| --sourceDir        | -s    | The directory location which contains your apex .cls classes.                                                                                                                                                                                                                                                                                                               | N/A             | Yes      |
| --targetDir        | -t    | The directory location where documentation will be generated to.                                                                                                                                                                                                                                                                                                            | `docs`          | No       |
| --recursive        | -r    | Whether .cls classes will be searched for recursively in the directory provided.                                                                                                                                                                                                                                                                                            | `true`          | No       |
| --scope            | -p    | A list of scopes to document. Values should be separated by a space, e.g --scope public private. Note that this setting is ignored if generating an OpenApi REST specification since that looks for classes annotated with @RestResource.                                                                                                                                   | `global`        | No       |
| --targetGenerator  | -g    | Define the static file generator for which the documents will be created. Currently supports: `jekyll`, `docsify`, `plain-markdown`, and `openapi`.                                                                                                                                                                                                                         | `jekyll`        | No       |
| --indexOnly        | N/A   | Defines whether only the index file should be generated.                                                                                                                                                                                                                                                                                                                    | `false`         | No       |
| --defaultGroupName | N/A   | Defines the `@group` name to be used when a file does not specify it.                                                                                                                                                                                                                                                                                                       | `Miscellaneous` | No       |
| --sanitizeHtml     | N/A   | When on, any special character within your ApexDocs is converted into its HTML code representation. This is specially useful when generic objects are described within the docs, e.g. "List< Foo>", "Map<Foo, Bar>" because otherwise the content within < and > would be treated as HTML tags and not shown in the output. Content in @example blocks are never sanitized. | `Apex REST Api` | No       |
| --openApiTitle     | N/A   | If using "openapi" as the target generator, this allows you to specify the OpenApi title value.                                                                                                                                                                                                                                                                             | true            | No       |
| --namespace        | N/A   | The package namespace, if any. If this value is provided the namespace will be added as a prefix to all of the parsed files. If generating an OpenApi definition, it will be added to the file's Server Url.                                                                                                                                                                | N/A             | No       |

### Importing to your project

If you are just interested in the Apex parsing capabilities, you can use the
standalone [Apex Reflection Library](https://www.npmjs.com/package/@cparra/apex-reflection)
which is what gets used by this library behind the scenes to generate the documentation files.

## Documentation Format

ApexDocs picks up blocks of comments throughout your `.cls` files. The block must begin with `/**` and end with `*/`.

### Documenting Classes

The following tags are supported on the class level:

**Note** Any custom generated tag is also supported. Custom tags can be added with at symbol (`@`) followed by the name
of the tag. For example `@custom-tag`

| Tag            | Description                                                                                                                                |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `@description` | One or more lines describing the class.                                                                                                    |
| `@see`         | The name of a related class.                                                                                                               |
| `@group`       | The group to which the class belongs to.                                                                                                   |
| `@author`      | The author of the class. Note that this only gets added if it is explicitly defined through the configuration class that it should.        |
| `@date`        | The date the class was created. Note that this only gets added if it is explicitly defined through the configuration class that it should. |

**Example**

```apex
/**
 * @description This is my class description.
 */
public with sharing class TestClass {
}
```

### Documenting Enums

The following tags are supported on the enum level:

| Tag            | Description                            |
|----------------|----------------------------------------|
| `@description` | One or more lines describing the enum. |

**Example**

```apex
/**
 * @description This is my enum description.
 */
public Enum ExampleEnum {
    VALUE_1, VALUE_2
}
```

### Documenting Properties

The following tags are supported on the property level:

| Tag            | Description                                |
|----------------|--------------------------------------------|
| `@description` | One or more lines describing the property. |

**Example**

```apex
/**
 * @description This is my property description.
 */
public String ExampleProperty { get; set; }
```

### Documenting Methods and Constructors

Methods and constructors support the same tags.

The following tags are supported on the method level:

| Tag                          | Description                                       |
|------------------------------|---------------------------------------------------|
| `@description`               | One or more lines describing the method.          |
| `@param` _paramName_         | Description of a single parameter.                |
| `@return`                    | Description of the return value of the method.    |
| `@example`                   | Example of how the code can be used or called.    |
| `@throws` _ExceptionName_    | Description of an exception thrown by the method. |
| `@exception` _ExceptionName_ | Same as `@throws`. V2 only                        |

**Example**

```apex
/**
 * @description This is my method description.
 * @param action The action to execute.
 * @return The result of the operation.
 * @example
 * Object result = SampleClass.call('exampleAction');
 */
public static Object call(String action) {
}
```

### Grouping Declarations Within A Class

A class might have members that should be grouped together. For example, you can have a class for constants with
groups of constants that should be grouped together because they share a common behavior (e.g. different groups
of constants representing the possible values for different picklists.)

You can group things together within a class by using the following syntax:

```apex
// @start-group Group Name or Description
public static final String CONSTANT_FOO = 'Foo';
public static final String CONSTANT_BAR = 'Bar';
// @end-group
```

Groups of members are displayed together under their own subsection after its name or description.

Some notes about grouping:

* This is only supported on classes, NOT enums and interfaces
* Supports
    * Properties
    * Fields (variables and constants)
    * Constructors
    * Methods
* BUT only members of the same type are grouped together. For example,
  if you have a group that contains properties and methods the properties will be grouped together under Properties ->
  Group Name, and the methods will be grouped together under Methods -> Group Name
* Does not support inner types (inner classes, interfaces, and enums)
* It is necessary to use `// @end-group` whenever a group has been started, otherwise a parsing error will be raised for
  that file.

### Inline linking

Apexdocs allows you to reference other classes from anywhere in your docs, and automatically creates a link to that
class file for easy navigation.

Apexdocs recognizes 2 different syntax when linking files:

- Javadoc's `{@link FileName}` syntax
- A class name wrapped in between `<<` `>>`.

**Example**

```apex
/**
 * @description This is my method description. This method receives an <<ExampleClass>>.
 * @param param1 An <<ExampleClass>> instance. Can also do {@link ExampleClass}
 * @return The result of the operation.
 */
public static Object doSomething(ExampleClass param1) {}
```

---

Email addresses can also be inlined linked by using the `{@email EMAIL_ADDRESS}` syntax.

### HTML support

For the most part all HTML is sanitized when the `--sanitizeHtml` flag is passed a true value (which is the default).
But there are some tags are allowed to have for the possibility of better
styling long text.

- Allowed tags are: `br`, `p`, `ul`, `li`, and `code`

Example

```apex
/**
 * @description <p>This is a paragraph</p>
 * <p>And this is another paragraph</p>
 * <ul>
 *     <li>This is a list item</li>
 *     <li>This is another list item</li>
 * </ul>
 */
class MyClass {
}
```

⚠️When the `--sanitizeHtml` flag is ON, any special character between code blocks (i.e. \```, \`, or `<code>`) will also
be escaped.
So if you have references to Apex generic collections (Set, List, or Maps) they will not look right, as the < and >
symbols will be escaped.
To prevent this you can turn the flag off, but be aware of the special considerations when doing this described below.

---

For full control over the output you can also turn off the `--sanitizeHtml` flag, which will allow you
to have any desired HTML within your docs.

⚠️When the `--sanitizeHtml` flag is OFF, references to Apex generic collections (Set, List or Maps) can be problematic
as they will be treated as an HTML tag and not displayed. For example if you have something
like `@description Returns a List<String>`
the `<String>` portion will be treated as HTML and thus not appear on the page.

To fix this issue, when not sanitizing HTML, you should wrap any code that contain special characters that can be
treated as HTML within '\`'
or within `<code>` tags.

## Generating OpenApi REST Definitions

ApexDocs supports generating OpenApi 3.1.0 REST definitions based on any `@RestResource` classes in your source code.

### Usage

To create an OpenApi specification file, run the `apexdocs-generate` and pass `openapi` to the `--targetGenerator` parameter.
When using this generator, you can also pass a custom title through the `--openApiTitle` parameter. This title will be placed
in the output file's `info.title` property, as defined by the [OpenApi documentation for the Info Object](https://spec.openapis.org/oas/v3.1.0#info-object)


```shell
apexdocs-generate -s ./src -t docs -g openapi --openApiTitle "Custom OpenApi Title"
```

### How It Works

When generating an OpenApi document, since `@RestResource` classes need to be global in Apex, the `--scope` parameter will be ignored.
Instead, ApexDocs will run through all classes annotated with `@RestResource` and add it to the output OpenApi file.

Once it finishes running, a file named `openapi.json` will be created in the specified `--targetDir`.

### Configuring What Gets Created

ApexDocs will automatically parse your source code and generate the OpenApi definition based on the HTTP related Apex
annotations (RestResource, HttpDelete, HttpGet, HttpPatch, HttpPost, HttpGet). The different HTTP annotations will be used to generate a file that complies with the [OpenApi Specification v3.1.0](https://spec.openapis.org/oas/v3.1.0)

Besides these annotations, the ApexDocs tool will also use any information provided through your code's Apexdocs, relying on
some custom annotations that are specific to generating OpenApi definitions:

* `@http-request-body`
* `@http-parameter`
* `@http-response`

#### @http-request-body

Allows you to specify the HTTP request's expected request body. It supports receiving a `description`,
whether it is `required` or not, and a `schema`, which defines the shape of the object that is expected.

📝 Note that only one `@http-request-body` should be defined per method. If you add more than one, only
a single one will be used when generating the OpenApi definition.

The `schema` can either be a reference to another class in your source code (see the `Class References` section below)
or a fully defined custom schema (See the `Custom Schemas` section below).

Example
```apex
/**
 * @description This is a sample HTTP Post method
 * @http-request-body
 * description: This is an example of a request body
 * required: true
 * schema: ClassName
 */ 
@HttpPost
global static void doPost() {
  ///...
}
```

📝 Note that each parameter of this annotation is expected to be on its own line. Parameters are treated as YAML,
so spacing is important.

#### @http-parameter

Allows you to specify any HTTP parameter expected by your method. It supports receiving a `name`,
an `in` as defined by the supported [Parameter Locations](https://spec.openapis.org/oas/v3.1.0#parameter-locations),
whether it is `required` or not, a `description`, and a `schema`.

📝 Note that you can specify as many `@http-parameter` annotations as needed.

Example
```apex
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
 * schema: MyClassName
 */
@HttpPost
global static String doPost() {
    // ..
}
```

📝 Note that each parameter of this annotation is expected to be on its own line. Parameters are treated as YAML,
   so spacing is important.

#### @http-response

Allows you to specify any HTTP response returned by your method. It supports receiving a `statusCode` with the response code,
a `description`, and a `schema`.

If no `description` is provided then one will be automatically built using the `statusCode`.

📝 Note that you can specify as many `@http-parameter` annotations as needed.

```apex
/**
 * @description This is a sample HTTP Post method
 * @return A String SObject.
 * @http-response
 * statusCode: 200
 * schema: SuccessfulResponseClassName
 * @http-response
 * statusCode: 500
 * description: Status Code 500 - An internal server error occurred.
 * schema:
 *   type: string
 */
@HttpPost
global static String doPost() {
    // ...
}
```

#### Class References

Whenever specifying a `schema` parameter, you can pass as a string the name of any class in your source code. This
class will be parsed by the ApexDocs tool and automatically converted to a reference in the resulting OpenApi definition.

The tool will parse the class and create a reference that complies with [Apex's support for User-Defined Types](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_methods.htm#ApexRESTUserDefinedTypes)

##### Reference Overrides

When dealing with references, there might be cases when you want to manually tell the parser what type of object a property
or field is. For example, let's say we have a class that looks as follows

```apex
public class MyClass {
  public Object myObject;
  public Account myAccountRecord;
}
```

In this case `myObject` has a type of `Object`, and `myAccountRecord` is an SObject. Neither of these will be accurately
parsed when building the OpenApi definition, instead they will be simple be referenced as `object` without any properties.

To accurately represent the shape of these objects, you can use the `@http-schema` annotation to essentially override its
type during parsing. In this annotation you can specify the same thing you would in any `schema` property when dealing with any
of the main `@http-*` methods, meaning a reference to another class, or a Custom Schema (as defined below).

```apex
public class MyClass {
  /**
   * @description This is a generic reference to another class 
   * @http-schema MyOtherClassName
   */
  public Object myObject;

  /**
   * @description This is a reference to an Account SObject
   * @http-schema
   * type: object
   * properties:
   *   Id:
   *     type: string
   *   Name:
   *     type: string
   *   CustomField__c:
   *     type: number
   */
  public Account myAccountRecord;
}
```

---

If dealing with a collection, you can also specify the name of the reference either using the `List` or `Set` syntax.

📝 When using List or Set syntax in the `schema` of the ApexDoc `@http-*` annotation, only collections one level
deep are supported (e.g. List<List<String>> is not supported). This is only a limitation when referencing collections
on the ApexDoc `schema` property directly, and is fully supported when multi-level collections are inside of a referenced
class as part of your codebase.

Maps are not supported, as it is not possible to know which keys the map will contain, and thus it is not possible
to convert that to a valid specification. For this use case, define a Custom Schema as explained below.

```apex
/**
 * @description This is a sample HTTP Post method
 * @http-request-body
 * description: This is an example of a request body
 * schema: List<ClassName>
 */
@HttpPost
global static void doPost() {
  ///...
}
```

Inner class references are also supported, but note that you need to pass the full name of the reference,
by using the `ParentClassName.InnerClassName` syntax, even if the inner class resides on the same class as the HTTP method
referencing it.

```apex
/**
 * @description This is a sample HTTP Post method
 * @http-request-body
 * description: This is an example of a request body
 * schema: ParentClass.InnerClass
 */
@HttpPost
global static void doPost() {
  ///...
}
```

#### Custom Schemas

For any `schema` parameter in any of the HTTP ApexDocs annotations, besides specifying the name of a class, you
can also specify a custom schema definition. The schema definition can either be for a primitive type, an `object` or an `array`

**Primitives**

For primitives, you should specify the `type` and an optional `format`, as defined by the [OpenApi Specification on Data Types](https://spec.openapis.org/oas/v3.1.0#data-types)

```apex
/**
 * ...
 * schema:
 *   type: string
 *   format: password
 */
```

**Objects**

To specify a custom object schema, use `object` as the `type`, and specify as many properties as follows:

```apex
/**
 * schema:
 *   type: object
 *   properties:
 *     id:
 *       type: string
 *       description: The super Id.
 *     name:
 *       type: string
 *     phone:
 *       type: string
 *       format: byte
*/
```

Properties can be defined as primitives (as explained above), other objects, or arrays (explained below)

**Arrays**

To specify a custom array schema, use `array` as the `type`, and provide an `items` definition. In `items`
you can specify the definition of any other custom type (primitives, objects, or other arrays).

```apex
/**
 * schema:
 *   type: array
 *   items:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 */
```

#### SObject References

ApexDocs is not able to automatically parse SObject references, as it can with class references, as it does
not reach into your org to get existing SObject describes. Because of this, when dealing with SObject references
you should create a Custom Schema as defined above. This will also allow you to specify which specific
fields are being received or returned.


### Considerations

Please be aware of the following when using ApexDocs to create an OpenApi definition:

* Map references are resolved as `object` with no properties, as it is not possible to know which keys the map will contain.
When using maps either create a class that better represents the shape of the object and use a Class Reference, or
define a Custom Schema in the `schema` section of the ApexDoc itself.
* Same thing when referencing SObjects, as SObject describe parsing is not supported by the ApexDocs tool. When referencing
SObjects, consider defining a Custom Schema in the `schema` section of the ApexDoc.
* ApexDoc is only able to parse through your source code, so references to other packages (namespaced classes) or any
code that lives outside your source code is not supported. Consider creating a Custom Schema for those situations.
* The return value and received parameters or your methods are currently not being considered when creating the OpenApi definition file.
Instead, use the `@http-response` ApexDoc annotation to specify the return value, and `@http-parameter` to specify any
expected parameter.

## Typescript

ApexDocs provides all necessary type definitions.

---

## 1.X

Looking for documentation for version 1.X? Please refer to its [branch](https://github.com/cesarParra/apexdocs/tree/1.x)
