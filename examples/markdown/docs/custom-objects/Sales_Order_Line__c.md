# Sales Order Line

Represents a line item on a sales order.

## API Name
`ns__Sales_Order_Line__c`

## Fields
### Amount
**Required**

**API Name**

`ns__Amount__c`

**Type**

*Currency*

---
### Product
**Required**

**API Name**

`ns__Product__c`

**Type**

*Lookup*

---
### Sales Order

**API Name**

`ns__Sales_Order__c`

**Type**

*MasterDetail*

---
### Source Price Component

**API Name**

`ns__Source_Price_Component__c`

**Type**

*Lookup*

---
### Type
**Required**

**API Name**

`ns__Type__c`

**Type**

*Picklist*

#### Possible values are
* Charge
* Discount