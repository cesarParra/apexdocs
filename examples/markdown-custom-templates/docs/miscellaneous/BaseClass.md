---
title: BaseClass
type: class
generated: '2025-12-15T21:24:38.010Z'
template: custom
---

# BaseClass

## Class Information

- **Type:** Class
- **Access Modifier:** public
- **File:** force-app/main/default/classes/BaseClass.cls

## Description

Base class providing common functionality for derived classes. 
This class demonstrates inheritance features that can be captured in custom templates. 
It includes protected methods and properties that inherited classes can use.

## Constructors

### BaseClass()

Constructor that initializes the base class. 
Sets the creation timestamp to the current time.

## Properties

### createdTimestamp

A protected property that stores the instance creation timestamp. 
Inherited classes can access and modify this property.

- **Type:** DateTime
- **Access:** protected

## Methods

### formatMessage(message)

A protected helper method that formats a message with a prefix. 
This method is only accessible to classes that extend BaseClass.

#### Parameters

- `message` (String): The message to format.

#### Returns

- **Type:** String
- **Description:** The formatted message with a prefix.

---

### getGreeting()

Virtual method that can be overridden by derived classes. 
Provides a default implementation that returns a simple greeting.

#### Returns

- **Type:** String
- **Description:** A greeting message.

---

### getIdentifier()

Abstract method that must be implemented by derived classes. 
This demonstrates how abstract methods appear in documentation. 
Derived classes must provide their own implementation.

#### Returns

- **Type:** String
- **Description:** A string representing the class identifier.

---

### getInstanceAge()

Gets the age of this instance in seconds. 
This method calculates how many seconds have passed since the instance was created.

#### Returns

- **Type:** Long
- **Description:** The age in seconds as a Long value.

---

## Examples

```apex
// Example usage of BaseClass
BaseClass instance = new BaseClass();
// Add your example code here
```