# MultiInheritanceClass Class

## Namespace
ns

**Inheritance**

[SampleClass](../samplegroup/SampleClass.md) < [BaseClass](../miscellaneous/BaseClass.md)

## Fields
### `sampleEnumFromBase`

*Inherited*

#### Signature
```apex
public sampleEnumFromBase
```

#### Type
[SampleEnum](../sample-enums/SampleEnum.md)

## Properties
### Group Name
#### `someProperty`

*Inherited*

##### Signature
```apex
public someProperty
```

##### Type
String

## Methods
### Available Methods
#### `doSomething()`

*Inherited*

##### Signature
```apex
public void doSomething()
```

##### Return Type
**void**

### Deprecated Methods
#### `sayHello()`

*Inherited*

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
SampleClass sample &#x3D; new SampleClass(); 
sample.doSomething();