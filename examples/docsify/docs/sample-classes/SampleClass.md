# SampleClass Class

`NAMESPACEACCESSIBLE`

This is a class description.

**Group** Sample Classes

**See** [SampleInterface](sample-interfaces/SampleInterface.md)

## Properties
### `MyProp`

This is a String property.

#### Signature
```apex
public MyProp
```

#### Type
String

---

### `AnotherProp`

This is a Decimal property.

#### Signature
```apex
public AnotherProp
```

#### Type
Decimal

## Constructors
### `SampleClass()`

`NAMESPACEACCESSIBLE`

Constructs a SampleClass without any arguments.

#### Signature
```apex
public SampleClass()
```

#### Example
```apex
SampleClass sampleInstance = new SampleClass();
```

---

### `SampleClass(argument)`

Constructs a SampleClass with an argument.

#### Signature
```apex
public SampleClass(String argument)
```

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| argument | String | Some argument |

## Methods
### `someTestMethod(argument)`

`NAMESPACEACCESSIBLE`

Executes commands based on the passed in argument.

#### Signature
```apex
public static String someTestMethod(String argument)
```

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| argument | String |  |

#### Return Type
**String**

#### Example
```apex
String result = SampleClass.testMethod();
System.debug(result);
```

---

### `call()`

Calls the method. 
This methods allows you to call it.

#### Signature
```apex
public static void call()
```

#### Return Type
**void**

## Classes
### InnerClass Class

Inner class belonging to SampleClass.

#### Properties
##### `InnerProp`

Description of the inner property.

###### Signature
```apex
public InnerProp
```

###### Type
String

#### Methods
##### `innerMethod()`

Executes from the inner class.

###### Signature
```apex
public void innerMethod()
```

###### Return Type
**void**

### AnotherInnerClass Class

Inner class belonging to SampleClass.

#### Properties
##### `InnerProp`

Description of the inner property.

###### Signature
```apex
public InnerProp
```

###### Type
String

#### Methods
##### `innerMethod()`

Executes from the inner class.

###### Signature
```apex
public void innerMethod()
```

###### Return Type
**void**