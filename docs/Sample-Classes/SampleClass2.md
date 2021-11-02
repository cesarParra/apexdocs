---
layout: default
---
# SampleClass2 class

`NamespaceAccessible`

This is a class description.

## Related

[SampleInterface](../Sample-Interfaces/SampleInterface.md)


[SampleClass](../Sample-Classes/SampleClass.md)

---
## Constructors
### `SampleClass2()`

`NamespaceAccessible`

Constructs a SampleClass2 without any arguments.
#### Example
```
<pre>
SampleClass2 sampleInstance = new SampleClass2();
```

### `SampleClass2(String argument)`

`NamespaceAccessible`

Constructs a SampleClass2 with an argument.
#### Parameters

| Param | Description |
| ----- | ----------- |
|`argument` |  Some argument |

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

`NamespaceAccessible`

Calls the method. This methods allows you to call it.

### `testMethod(String argument)` → `String`

`NamespaceAccessible`

Executes commands based on the passed in argument.

#### Example
```
<pre>
String result = SampleClass2.testMethod();
System.debug(result);
```

---
## Inner Classes

### SampleClass2.AnotherInnerClass class

Inner class belonging to SampleClass2.

---
#### Properties

##### `InnerProp` → `public`

Description of the inner property.

---
#### Methods
##### `innerMethod()` → `void`

Executes from the inner class.

---
### SampleClass2.InnerClass class

Inner class belonging to SampleClass2.

---
#### Properties

##### `InnerProp` → `public`

Description of the inner property.

---
#### Methods
##### `innerMethod()` → `void`

Executes from the inner class.

---
