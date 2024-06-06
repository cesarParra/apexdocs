# nspc.ChildClass

Some desc


**Inheritance**

[nspc.GrandparentClass](types/Misc-Group/nspc.GrandparentClass.md)
 &gt; 
[nspc.ParentClass](types/Misc-Group/nspc.ParentClass.md)
 &gt; 
ChildClass


**Implemented types**

[nspc.SampleInterface](types/Sample-Interfaces/nspc.SampleInterface.md)


**Group** Classes

## Fields

### `private aPrivateString` → `String`


### `private privateStringFromChild` → `String`


### `protected protectedGrandParentField` → `String`

*Inherited*

### `protected protectedStringFromParent` → `String`

*Inherited*

This is a protected string, use carefully.

### `public publicStringFromParent` → `String`

*Inherited*

---
## Properties

### `protected AProp` → `String`

*Inherited*

---
## Methods
### `public void doSomething()`
### `public void execute()`

Executes the command.

### `public String getValue()`

Returns a value based on the executed command.

#### Returns

|Type|Description|
|---|---|
|`String`|The value|

### `public virtual String overridableMethod()`

*Inherited*

### `public override String overridableMethodOverridden()`

This method was overridden.

#### Returns

|Type|Description|
|---|---|
|`String`|A String.|


```mermaid
sequenceDiagram
    participant dotcom
    participant iframe
    participant viewscreen
    dotcom->>iframe: loads html w/ iframe url
    iframe->>viewscreen: request template
    viewscreen->>iframe: html & javascript
    iframe->>dotcom: iframe ready
    dotcom->>iframe: set mermaid data on iframe
    iframe->>iframe: render mermaid
```


---
