---
layout: default
---
# SampleClass class

`NamespaceAccessible`

This is a class description.

---
## Constructors
### `SampleClass()`

`NamespaceAccessible`

Constructs a SampleClass without any arguments.
#### Throws
|Exception|Description|
|---------|-----------|
|`ExcName` | some exception |

#### Example
```
<pre>
// <strong>Example</strong>
SampleClass sampleInstance = new SampleClass();
</pre>
```

### `SampleClass(String argument)`

Constructs a SampleClass with an argument.
#### Parameters
|Param|Description|
|-----|-----------|
|`argument` | Argument definition |

#### Throws
|Exception|Description|
|---------|-----------|

---
## Enums
### InnerEnum


`NamespaceAccessible`

---
## Properties

### `AnotherProp` → `Decimal`

`NamespaceAccessible`

This is a Decimal property.

### `MyProp` → `String`

`NamespaceAccessible`

This is a String property.

---
## Methods
### `call()` → `void`

Calls the method. This methods allows you to call it.

#### Throws
|Exception|Description|
|---------|-----------|

### `sampleMethod(String argument)` → `String`

`NamespaceAccessible`

Executes commands based on the passed in argument.

#### Parameters
|Param|Description|
|-----|-----------|
|`argument` | Argument to debug |

#### Return

**Type**

String

**Description**

Empty string

#### Throws
|Exception|Description|
|---------|-----------|

#### Example
```
<pre>
String result = SampleClass.testMethod();
System.debug(result);
```

---
## Inner Classes

### AnotherInnerClass class

Inner class belonging to SampleClass.

---
#### Properties

##### `InnerProp` → `String`

Description of the inner property.

---
#### Methods
##### `innerMethod()` → `void`

Executes from the inner class.

###### Throws
|Exception|Description|
|---------|-----------|

---
### InnerClass class

Inner class belonging to SampleClass.

---
#### Properties

##### `InnerProp` → `String`

Description of the inner property.

---
#### Methods
##### `innerMethod()` → `void`

Executes from the inner class.

###### Throws
|Exception|Description|
|---------|-----------|

---
