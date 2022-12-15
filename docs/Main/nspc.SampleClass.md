# nspc.SampleClass

`NAMESPACEACCESSIBLE`

`APIVERSION: 54`

`STATUS: ACTIVE`

This is a class description. This class relates to [nspc.SampleInterface](/Sample-Interfaces/nspc.SampleInterface.md)
             But this [ClassThatDoesNotExist](ClassThatDoesNotExist) does not exist.
             You can also link using this syntax [nspc.SampleInterface](/Sample-Interfaces/nspc.SampleInterface.md)


**Group** Main


**CustomAnnotation** A Custom annotation


**Author** Cesar Parra


**See** [nspc.SampleInterface](/Sample-Interfaces/nspc.SampleInterface.md)

## Constructors
### My Super Group
##### `SampleClass()`

`NAMESPACEACCESSIBLE`

Constructs a SampleClass without any arguments. This relates to [nspc.SampleInterface](/Sample-Interfaces/nspc.SampleInterface.md)

###### Throws

|Exception|Description|
|---|---|
|`ExcName`|some exception|


**CustomAnnotation** A Custom method annotation


**See** [nspc.SampleInterface](/Sample-Interfaces/nspc.SampleInterface.md)

###### Example
```apex
// Example
SampleClass sampleInstance = new SampleClass();
```


---
### Other
##### `SampleClass(String argument1, String argument2)`

Constructs a SampleClass with an argument.

###### Parameters

|Param|Description|
|---|---|
|`argument1`|Argument1 definition|
|`argument2`|Argument2 definition|

---
## Fields
### Common Constants

* `ANOTHER_CONSTANT` → `String` (*Inherited*)  
* `A_CONSTANT` → `String` (*Inherited*)  [`NAMESPACEACCESSIBLE` ]  - This is a constant.
* `listOfStrings` → `List<String>` (*Inherited*)  
---
### 'General' Constants

* `GENERAL_ANOTHER_CONSTANT` → `String` (*Inherited*)  
* `GENERAL_A_CONSTANT` → `String` (*Inherited*)  [`NAMESPACEACCESSIBLE` ]  - This is a constant.
---
### Other variables

* `someVariable` → `String` (*Inherited*)  
---
## Properties

### `AnotherProp` → `Decimal`

`AURAENABLED` 

This is a Decimal property.

### `MyProp` → `String`

`AURAENABLED` 
`DEPRECATED` 

This is a String property.

---
## Methods
### `static sampleMethod(String argument1, String argument2)`

`NAMESPACEACCESSIBLE`

Executes commands based on the passed in argument.

#### Parameters

|Param|Description|
|---|---|
|`argument1`|Argument1 to debug|
|`argument2`|Argument2 to debug|

#### Return

**Type**

String

**Description**

Empty string

#### Example
```apex
String result = SampleClass.testMethod();
System.debug(result);
```


### `static anotherSampleMethod(String arg1)`

Something here


**Arg1** The arg1 description

### `static call()`

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

##### `InnerProp` → `String`


Description of the inner property.

---
#### Methods
##### `innerMethod()`

Executes from the inner class.

---

### InnerClass

Inner class belonging to SampleClass.

#### Properties

##### `InnerProp` → `String`


Description of the inner property.

---
#### Methods
##### `innerMethod()`

Executes from the inner class.

---

---
