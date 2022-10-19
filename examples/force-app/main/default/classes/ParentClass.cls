public virtual class ParentClass extends GrandparentClass{
    // @start-group Common Constants
    private String privateString;
    /**
     * @description This is a protected string, use carefully.
     */
    protected String protectedString;
    public String publicString;
    // @end-group Common Constants

    public virtual String overridableMethod() {
        return '';
    }
}