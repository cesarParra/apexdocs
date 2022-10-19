public virtual class ParentClass extends GrandparentClass{
    private String privateString;
    /**
     * @description This is a protected string, use carefully.
     */
    protected String protectedString;
    public String publicString;

    public virtual String overridableMethod() {
        return '';
    }

    public virtual String overridableMethodOverridden() {
        return '';
    }
}