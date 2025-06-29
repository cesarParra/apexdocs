# Sales Order Line

Represents a line item on a sales order.

## Nombre API
`Sales_Order_Line__c`

## Campos
### Amount
**Requerido**

**Nombre API**

`Amount__c`

**Tipo**

*Currency*

---
### Product
**Requerido**

**Nombre API**

`Product__c`

**Tipo**

*Lookup*

---
### Sales Order

**Nombre API**

`Sales_Order__c`

**Tipo**

*MasterDetail*

---
### Source Price Component

**Nombre API**

`Source_Price_Component__c`

**Tipo**

*Lookup*

---
### Type
**Requerido**

**Nombre API**

`Type__c`

**Tipo**

*Picklist*

#### Possible values are
* Charge
* Discount