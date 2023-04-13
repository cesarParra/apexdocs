# nspc.SampleClass

`NAMESPACEACCESSIBLE`

This is a class description. This class relates to [nspc.SampleInterface](types/Sample-Interfaces/nspc.SampleInterface.md)
             But this [ClassThatDoesNotExist](ClassThatDoesNotExist) does not exist.
             You can also link using this syntax [nspc.SampleInterface](types/Sample-Interfaces/nspc.SampleInterface.md)


**Group** Main


**CustomAnnotation** A Custom annotation


**Author** Cesar Parra


**See** [nspc.SampleInterface](types/Sample-Interfaces/nspc.SampleInterface.md)

## Constructors
### My Super Group
##### `public SampleClass()`

`NAMESPACEACCESSIBLE`

Constructs a SampleClass without any arguments. This relates to [nspc.SampleInterface](types/Sample-Interfaces/nspc.SampleInterface.md)

###### Throws

|Exception|Description|
|---|---|
|`ExcName`|some exception|


**CustomAnnotation** A Custom method annotation


**See** [nspc.SampleInterface](types/Sample-Interfaces/nspc.SampleInterface.md)

###### Example
```apex
// Example
SampleClass sampleInstance = new SampleClass();
```


---
### Other
##### `public SampleClass(String argument1, String argument2)`

Constructs a SampleClass with an argument.

###### Parameters

|Param|Description|
|---|---|
|`argument1`|Argument1 definition|
|`argument2`|Argument2 definition|

---
## Fields
### Common Constants

* `public ANOTHER_CONSTANT` → `String` 
* `public A_CONSTANT` → `String` [`NAMESPACEACCESSIBLE` ]  - This is a constant.
* `public listOfStrings` → `List<String>` 
---
### 'General' Constants

* `public GENERAL_ANOTHER_CONSTANT` → `String` 
* `public GENERAL_A_CONSTANT` → `String` [`NAMESPACEACCESSIBLE` ]  - This is a constant.
---
### Other variables

* `public someVariable` → `String` 
---
### Other

* `private somePrivateStuff` → `String` 
---
## Properties

### `public AnotherProp` → `Decimal`

`AURAENABLED` 

This is a Decimal property.

### `public MyProp` → `String`

`AURAENABLED` 
`DEPRECATED` 

This is a String property.

---
## Methods
### A method group
##### `public static sampleMethod(String argument1, String argument2)`

`NAMESPACEACCESSIBLE`

Executes commands based on the passed in argument.

###### Parameters

|Param|Description|
|---|---|
|`argument1`|Argument1 to debug|
|`argument2`|Argument2 to debug|

###### Returns

|Type|Description|
|---|---|
|String|Empty string|

###### Example
```apex
String result = SampleClass.testMethod();
System.debug(result);
```


##### `public static anotherSampleMethod(String arg1)`

Something here


**Arg1** The arg1 description

---
### Other
##### `public static call()`

Calls the method. This methods allows you to call it.

---
## Enums
### InnerEnum

`NAMESPACEACCESSIBLE`

This is a namespace accessible enum


---
## Classes
### AnotherInnerClass

Inner class belonging to SampleClass.

#### Properties

##### `public InnerProp` → `String`


Description of the inner property.

---
#### Methods
##### `public innerMethod()`

Executes from the inner class.

---

### InnerClass

Inner class belonging to SampleClass.

#### Properties

##### `public InnerProp` → `String`


Description of the inner property.

---
#### Methods
##### `public innerMethod()`

Executes from the inner class.

---

---
