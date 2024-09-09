# SomeDto Class

Some description

**See** [ASampleClass](miscellaneous/ASampleClass.md)

## Properties
### `Items`

`AURAENABLED`

#### Signature
```apex
public Items
```

#### Type
List&lt;CartItemDto&gt;

---

### `SubTotal`

`AURAENABLED`

#### Signature
```apex
public SubTotal
```

#### Type
Decimal

---

### `Total`

`AURAENABLED`

#### Signature
```apex
public Total
```

#### Type
Decimal

---

### `Discounts`

`AURAENABLED`

#### Signature
```apex
public Discounts
```

#### Type
Decimal

## Constructors
### `SomeDto(proForma)`

Constructs a CartDto

#### Signature
```apex
public SomeDto(nams.Order proForma)
```

#### Parameters
| Name | Type | Description |
|------|------|-------------|
| proForma | nams.Order | The pro forma |

## Classes
### CartItemDto Class

Used in cartItem.html

#### Properties
##### `Id`

`AURAENABLED`

Id Unique identifier for this object.

###### Signature
```apex
public Id
```

###### Type
String

---

##### `Description`

`AURAENABLED`

Description The description to display for this item.

###### Signature
```apex
public Description
```

###### Type
String

---

##### `Quantity`

`AURAENABLED`

Quantity Amount of this item currently in the cart.

###### Signature
```apex
public Quantity
```

###### Type
Decimal

---

##### `Price`

`AURAENABLED`

Price Calculated price for this item.

###### Signature
```apex
public Price
```

###### Type
Decimal

---

##### `CurrencyCode`

`AURAENABLED`

The currency code for this item.

###### Signature
```apex
public CurrencyCode
```

###### Type
String

---

##### `ProductImage`

`AURAENABLED`

ProductImage Main display image to display for this item.

###### Signature
```apex
public ProductImage
```

###### Type
String

---

##### `IsDiscounted`

`AURAENABLED`

IsDiscounted Whether the item has been discounted or not.

###### Signature
```apex
public IsDiscounted
```

###### Type
Boolean

---

##### `AdjustedPrice`

`AURAENABLED`

AdjustedPrice If the item has been discounted, this contains the adjusted (lower) price.

###### Signature
```apex
public AdjustedPrice
```

###### Type
Decimal

---

##### `DiscountReason`

`AURAENABLED`

DiscountReason If the item has been discounted, this contains a human-readable reason for the discount.

###### Signature
```apex
public DiscountReason
```

###### Type
String

#### Constructors
##### `CartItemDto(id, description, quantity, price, currencyCode, productImage, isDiscounted, adjustedAmount, discountReason)`

###### Signature
```apex
public CartItemDto(String id, String description, Decimal quantity, Decimal price, String currencyCode, String productImage, Boolean isDiscounted, Decimal adjustedAmount, String discountReason)
```

###### Parameters
| Name | Type | Description |
|------|------|-------------|
| id | String |  |
| description | String |  |
| quantity | Decimal |  |
| price | Decimal |  |
| currencyCode | String |  |
| productImage | String |  |
| isDiscounted | Boolean |  |
| adjustedAmount | Decimal |  |
| discountReason | String |  |