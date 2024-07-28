# SampleClass Class
`virtual`

aliquip ex sunt officia ullamco anim deserunt magna aliquip nisi eiusmod in sit officia veniam ex 

deserunt ea officia exercitation laboris enim in duis quis enim eiusmod eu amet cupidatat.

**Group** SampleGroup

## Namespace
ns

## Example
```apex
SampleClass sample = new SampleClass();
sample.doSomething();
```

**Inheritance**
[ns.BaseClass](../Miscellaneous/ns.BaseClass.md)

**Implements**
[ns.SampleInterface](../Miscellaneous/ns.SampleInterface.md), 
[ns.ParentInterface](../Miscellaneous/ns.ParentInterface.md)

## Fields
### Group Name
#### `name`

This is a sample field.

##### Signature
```apex
private final name
```

##### Type
String

### Other
#### `sampleEnumFromBase`

*Inherited*

##### Signature
```apex
public sampleEnumFromBase
```

##### Type
[ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)

## Properties
### Group Name
#### `someProperty`

##### Signature
```apex
public someProperty
```

##### Type
String

## Constructors
### Other
#### `SampleClass()`

This is a sample constructor.

##### Signature
```apex
public SampleClass()
```

### Other Constructors
#### `SampleClass(name)`

##### Signature
```apex
public SampleClass(String name)
```

##### Parameters
| Name | Type | Description |
|------|------|-------------|
| name | String |  |

## Methods
### Available Methods
#### `doSomething()`

##### Signature
```apex
public void doSomething()
```

##### Return Type
**void**

### Deprecated Methods
#### `sayHello()`

`DEPRECATED`

This is a sample method.

##### Signature
```apex
public virtual String sayHello()
```

##### Return Type
**String**

A string value.

##### Example
```apex
SampleClass sample = new SampleClass();
sample.doSomething();
```

## Classes
### SomeInnerClass Class

#### Fields
##### `someInnerField`

###### Signature
```apex
public someInnerField
```

###### Type
String

#### Methods
##### `doSomething()`

###### Signature
```apex
public void doSomething()
```

###### Return Type
**void**

## Enums
### SomeEnum Enum

This enum is used for foo and bar.

#### Values
| Value | Description |
|-------|-------------|
| TEST_1 | This is a test. |
| TEST_2 |  |
| TEST_3 |  |

## Interfaces
### SomeInterface Interface

#### Methods
##### `doSomething()`

###### Signature
```apex
public void doSomething()
```

###### Return Type
**void**
