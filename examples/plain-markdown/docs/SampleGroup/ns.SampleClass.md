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

**Extends**
[ns.BaseClass](../Miscellaneous/ns.BaseClass.md)

**Implements**
[ns.SampleInterface](../Miscellaneous/ns.SampleInterface.md), 
[ns.ParentInterface](../Miscellaneous/ns.ParentInterface.md)

## Fields
### `name`

This is a sample field.

#### Type
String

---

### `sampleEnumFromBase`

*Inherited*

#### Type
[ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)

## Constructors
### `SampleClass()`

This is a sample constructor.

### Signature
```apex
public SampleClass()
``` 

---
### `SampleClass(name)`

### Signature
```apex
public SampleClass(String name)
``` 

### Parameters
| Name | Type | Description |
|------|------|-------------|
| name | String |  |

## Methods
### `sayHello()`

`DEPRECATED`

This is a sample method.

### Signature
```apex
public virtual String sayHello()
``` 

### Returns
**String**

A string value.

### Example
```apex
SampleClass sample = new SampleClass();
sample.doSomething();
```
