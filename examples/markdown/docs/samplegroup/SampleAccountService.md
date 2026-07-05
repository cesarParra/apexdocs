# SampleAccountService Class

Manages sample accounts. Returns `null` when an account is missing, 
and treats &lt;NULL&gt; markers literally. Delegates most work to 
 [SampleClass.sayHello()](SampleClass.md#sayhello) .

**Since**

1.0.0

**Version**

2.3.0

**Group** SampleGroup

**Author** John Doe

**Author** Jane Doe

**See** [SampleClass.sayHello()](SampleClass.md#sayhello)

**See** The Salesforce Security Guide

**See** [Operations Runbook](https://example.com/runbook)

## Namespace
ns

## Methods
### Queries
#### `getAccount(accountId)`

Fetches an account by id.

##### Signature
```apex
public Account getAccount(Id accountId)
```

##### Parameters
| Name | Type | Description |
|------|------|-------------|
| accountId | Id | The id of the account. Must not be `null` . |

##### Return Type
**[Account](../custom-objects/Account.md)**

The matching account, or `null` when none exists.

**Author** Jane Doe

**See** [SampleClass](SampleClass.md)

### Persistence
#### `saveAccount(record)`

> **Deprecated** Use [SampleAccountService.getAccount](SampleAccountService.md#getaccount) and save through the standard API instead.

Saves the account.

##### Signature
```apex
public void saveAccount(Account record)
```

##### Parameters
| Name | Type | Description |
|------|------|-------------|
| record | [Account](../custom-objects/Account.md) | The account to save. |

##### Return Type
**void**