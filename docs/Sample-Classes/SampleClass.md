# SampleClass

`namespaceAccessible`

This is a class description.


**group** Sample Classes

**author** Cesar Parra
## Constructors
### `SampleClass()`

`namespaceAccessible`

Constructs a SampleClass without any arguments.
#### Throws
|Exception|Description|
|---------|-----------|
|`ExcName` | some exception |

#### Example
```apex
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
## Fields

### `AnotherProp` → `Decimal`

This is a Decimal property.

### `MyProp` → `String`

This is a String property.

---
## Methods
### `sampleMethod(String argument)`

`namespaceAccessible`

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
```apex
<pre>
String result = SampleClass.testMethod();
System.debug(result);
```

### `call()`

Calls the method. This methods allows you to call it.
#### Throws
|Exception|Description|
|---------|-----------|

---
## Enums
## InnerEnum

`namespaceAccessible`

---
## Classes
## AnotherInnerClass

Inner class belonging to SampleClass.

### Fields

#### `InnerProp` → `String`

Description of the inner property.

---
### Methods
#### `innerMethod()`

Executes from the inner class.
##### Throws
|Exception|Description|
|---------|-----------|

---

## InnerClass

Inner class belonging to SampleClass.

### Fields

#### `InnerProp` → `String`

Description of the inner property.

---
### Methods
#### `innerMethod()`

Executes from the inner class.
##### Throws
|Exception|Description|
|---------|-----------|

---

---
