# MultiInheritanceClass Class

## Namespace
ns

**Inheritance**
[ns.SampleClass](../SampleGroup/ns.SampleClass.md) < [ns.BaseClass](./ns.BaseClass.md)

## Fields
### `sampleEnumFromBase`

*Inherited*

#### Signature
```apex
public sampleEnumFromBase
```

#### Type
[ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)

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
```apex
SampleClass sample = new SampleClass();
sample.doSomething();
```