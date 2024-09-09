/**
 * @description Some description
 * @see ASampleClass
 */
public with sharing class SomeDto {
    /**
     * @description Used in cartItem.html
     */
    public class CartItemDto {
        public CartItemDto(String id, String description, Decimal quantity, Decimal price, String currencyCode, String productImage, Boolean isDiscounted, Decimal adjustedAmount, String discountReason) {
            this.Id = id;
            this.Description = description;
            this.Quantity = quantity;
            this.Price = price.setScale(2);
            this.CurrencyCode = currencyCode;
            this.ProductImage = productImage;
            this.IsDiscounted = isDiscounted;
            this.AdjustedPrice = adjustedAmount.setScale(2);
            this.DiscountReason = discountReason;
        }

        /**
         * @description Id Unique identifier for this object.
         */
        @AuraEnabled
        public String Id { get; set; }

        /**
         * @description Description The description to display for this item.
         */
        @AuraEnabled
        public String Description { get; set; }

        /**
         * @description Quantity Amount of this item currently in the cart.
         */
        @AuraEnabled
        public Decimal Quantity { get; set; }

        /**
         * @description Price Calculated price for this item.
         */
        @AuraEnabled
        public Decimal Price { get; set; }

        /**
         * @description The currency code for this item.
         */
        @AuraEnabled
        public String CurrencyCode { get; set; }

        /**
         * @description ProductImage Main display image to display for this item.
         */
        @AuraEnabled
        public String ProductImage { get; set; }

        /**
         * @description IsDiscounted Whether the item has been discounted or not.
         */
        @AuraEnabled
        public Boolean IsDiscounted { get; set; }

        /**
         * @description AdjustedPrice If the item has been discounted, this contains the adjusted (lower) price.
         */
        @AuraEnabled
        public Decimal AdjustedPrice { get; set; }

        /**
         * @description DiscountReason If the item has been discounted, this contains a human-readable reason for the discount.
         */
        @AuraEnabled
        public String DiscountReason { get; set; }
    }

    @AuraEnabled
    public List<CartItemDto> Items { get; set; }

    @AuraEnabled
    public Decimal SubTotal { get; set; }

    @AuraEnabled
    public Decimal Total { get; set; }

    @AuraEnabled
    public Decimal Discounts { get; set; }

    /**
     * @description Constructs a CartDto
     * @param proForma The pro forma
     */
    public CartDto(nams.Order proForma) {
        this.Items = new List<CartDto.CartItemDto>();
        this.SubTotal = proForma.getSubTotal().getValue().setScale(2);
        this.Total = proForma.getGrandTotal().getValue().setScale(2);
        this.Discounts = proForma.getTotalDiscounts().getValue().setScale(2);

        for (OrderLine line : proForma.getLines()) {
            String imageUrl;
            if (!line.getProduct().getImages().isEmpty()) {
                imageUrl = line.getProduct().getImages()[0].getImageUrl();
            }
            Boolean isDiscounted = line.getTotalDiscounts() != Money.zero();
            String discountReason;
            if (isDiscounted) {
                discountReason = line.getAdjustments()[0].getDescription();
            }
            this.Items.add(new CartItemDto(
                line.getId(),
                line.getProduct().getName(),
                line.getQuantity(),
                line.getSubTotal().getValue(),
                line.getUnitPrice().getCurrency(),
                imageUrl,
                isDiscounted,
                line.getGrandTotal().getValue(),
                discountReason
            ));
        }
    }
}
