# LWCHelper Class

Helper class for Lightning Web Components

**Group** Lightning Web Components

**Author** ApexDocs Team

## Methods
### `getPicklistValues(objectApiName, fieldApiName)`

`AURAENABLED`

Retrieves picklist values for a given object and field

#### Signature
```apex
public static List<PicklistEntry> getPicklistValues(String objectApiName, String fieldApiName)
```

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| objectApiName | String | The API name of the object |
| fieldApiName | String | The API name of the field |

#### Return Type
**List&lt;PicklistEntry&gt;**

List of picklist entries with label and value

#### Example
List&lt;PicklistEntry&gt; entries &#x3D; LWCHelper.getPicklistValues(&#x27;Account&#x27;, &#x27;Industry&#x27;);

---

### `getCurrentUserInfo()`

`AURAENABLED`

Retrieves current user information for LWC components

#### Signature
```apex
public static UserInfo getCurrentUserInfo()
```

#### Return Type
**UserInfo**

UserInfo object containing user details

---

### `checkUserPermission(objectApiName, operation)`

`AURAENABLED`

Validates user permissions for a specific object and operation

#### Signature
```apex
public static Boolean checkUserPermission(String objectApiName, String operation)
```

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| objectApiName | String | The API name of the object |
| operation | String | The operation to check (&#x27;create&#x27;, &#x27;read&#x27;, &#x27;update&#x27;, &#x27;delete&#x27;) |

#### Return Type
**Boolean**

True if user has permission, false otherwise

## Classes
### PicklistEntry Class

Inner class to represent picklist entries

#### Properties
##### `label`

`AURAENABLED`

###### Signature
```apex
public label
```

###### Type
String

---

##### `value`

`AURAENABLED`

###### Signature
```apex
public value
```

###### Type
String

#### Constructors
##### `PicklistEntry(label, value)`

###### Signature
```apex
public PicklistEntry(String label, String value)
```

###### Parameters
| Name | Type | Description |
|------|------|-------------|
| label | String |  |
| value | String |  |

### UserInfo Class

Inner class to represent user information

#### Properties
##### `userId`

`AURAENABLED`

###### Signature
```apex
public userId
```

###### Type
Id

---

##### `userName`

`AURAENABLED`

###### Signature
```apex
public userName
```

###### Type
String

---

##### `userEmail`

`AURAENABLED`

###### Signature
```apex
public userEmail
```

###### Type
String

---

##### `profileId`

`AURAENABLED`

###### Signature
```apex
public profileId
```

###### Type
Id

#### Constructors
##### `UserInfo(userId, userName, userEmail, profileId)`

###### Signature
```apex
public UserInfo(Id userId, String userName, String userEmail, Id profileId)
```

###### Parameters
| Name | Type | Description |
|------|------|-------------|
| userId | Id |  |
| userName | String |  |
| userEmail | String |  |
| profileId | Id |  |