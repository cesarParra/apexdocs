# AccountService Class

Service class for handling Account operations

**Group** Account Management

**Author** ApexDocs Team

## Methods
### `getAccountById(accountId)`

Retrieves an Account record by its Id

#### Signature
```apex
public static Account getAccountById(Id accountId)
```

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| accountId | Id | The Id of the Account to retrieve |

#### Return Type
**Account**

The Account record or null if not found

#### Example
Account acc &#x3D; AccountService.getAccountById(&#x27;0011234567890123&#x27;);

---

### `createAccount(accountName, accountType)`

Creates a new Account record

#### Signature
```apex
public static Id createAccount(String accountName, String accountType)
```

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| accountName | String | The name for the new Account |
| accountType | String | The type of Account to create |

#### Return Type
**Id**

The Id of the newly created Account

#### Throws
DmlException: if the Account cannot be created

---

### `updateAccountIndustry(accountIds, industry)`

Updates the industry field for multiple accounts

#### Signature
```apex
public static Integer updateAccountIndustry(List<Id> accountIds, String industry)
```

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| accountIds | List&lt;Id&gt; | List of Account Ids to update |
| industry | String | The industry value to set |

#### Return Type
**Integer**

Number of successfully updated accounts