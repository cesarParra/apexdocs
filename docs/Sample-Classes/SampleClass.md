---
layout: default
---
# SampleClass class

`NamespaceAccessible`

This is a class description.

## Related

[SampleInterface](../Sample-Interfaces/SampleInterface.md)


[SampleClass2](../Sample-Classes/SampleClass2.md)

---
## Constructors
### `SampleClass()`

`NamespaceAccessible`

Constructs a SampleClass without any arguments.
#### Example
```
<pre>
SampleClass sampleInstance = new SampleClass();
```

### `SampleClass(String argument)`

`NamespaceAccessible`

Constructs a SampleClass with an argument.
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
String result = SampleClass.testMethod();
System.debug(result);
```

---
## Inner Classes

### SampleClass.AnotherInnerClass class

Inner class belonging to SampleClass.

---
#### Properties

##### `InnerProp` → `public`

Description of the inner property.

---
#### Methods
##### `innerMethod()` → `void`

Executes from the inner class.

---
### SampleClass.InnerClass class

Inner class belonging to SampleClass.

---
#### Properties

##### `InnerProp` → `public`

Description of the inner property.

---
#### Methods
##### `innerMethod()` → `void`

Executes from the inner class.

---
