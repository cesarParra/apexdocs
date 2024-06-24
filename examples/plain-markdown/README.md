# Template file

# BaseClass Class
`abstract`

## Namespace
ns

## Fields
### `sampleEnumFromBase`

#### Type
[ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)


---

# ParentInterface Interface

## Namespace
ns

## Methods
### `sampleParentMethod()`

### Signature
```apex
public void sampleParentMethod()
``` 

### Returns
**void**


---

# ReferencedEnum Enum

## Namespace
ns

## Enum Values


---

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


---

# SampleEnum Enum

`NAMESPACEACCESSIBLE`

This is a sample enum. This references [ns.ReferencedEnum](../Miscellaneous/ns.ReferencedEnum.md) . 

This description has several lines

**Some Custom** 

**Group** Sample Enums

**Author** John Doe

**Date** 2022-01-01

**See** [ns.ReferencedEnum](../Miscellaneous/ns.ReferencedEnum.md)

## Namespace
ns

```mermaid
graph TD
 A[SampleEnum] --&gt;|references| B[ReferencedEnum]
 B --&gt;|referenced by| A
```

## Enum Values
### VALUE1
This is value 1
### VALUE2
This is value 2
### VALUE3
This is value 3


---

# SampleException Class

## Namespace
ns

**Extends**
Exception


---

# SampleInterface Interface

`NAMESPACEACCESSIBLE`

This is a sample interface

**Author** John Doe

**Date** 2020-01-01

**See** [ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)

**See** [ns.ReferencedEnum](./ns.ReferencedEnum.md)

## Namespace
ns

```mermaid
graph TD
   A[SampleInterface] --&gt;|extends| B[ParentInterface]
   B --&gt;|extends| C[GrandParentInterface]
   C --&gt;|extends| D[GreatGrandParentInterface]
```

## Example
```apex
SampleInterface sampleInterface = new SampleInterface();
sampleInterface.sampleMethod();
```

**Extends**
[ns.ParentInterface](./ns.ParentInterface.md)

## Methods
### `sampleMethod()`

`NAMESPACEACCESSIBLE`

This is a sample method

**Custom Tag** 

**Another Custom Tag** 

### Signature
```apex
public String sampleMethod()
``` 

### Returns
**String**

Some return value

### Throws
[ns.SampleException](./ns.SampleException.md): This is a sample exception

AnotherSampleException: This is another sample exception

```mermaid
graph TD
  A[SampleInterface] --&gt;|extends| B[ParentInterface]
  B --&gt;|extends| C[GrandParentInterface]
  C --&gt;|extends| D[GreatGrandParentInterface]
```

### Example
```apex
SampleInterface sampleInterface = new SampleInterface();
sampleInterface.sampleMethod();
```

---

### `sampleMethodWithParams(param1, param2, theEnum)`

`NAMESPACEACCESSIBLE`
`DEPRECATED`

This is a sample method with parameters 

Sometimes it won&#x27;t be possible to find a NonExistent link.

### Signature
```apex
public SampleEnum sampleMethodWithParams(String param1, Integer param2, SampleEnum theEnum)
``` 

### Parameters
| Name | Type | Description |
|------|------|-------------|
| param1 | String | This is the first parameter |
| param2 | Integer | This is the second parameter |
| theEnum | [ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md) | This is an enum parameter |

### Returns
**[ns.SampleEnum](../Sample-Enums/ns.SampleEnum.md)**

Some return value

---

### `sampleParentMethod()`

*Inherited*

### Signature
```apex
public void sampleParentMethod()
``` 

### Returns
**void**


