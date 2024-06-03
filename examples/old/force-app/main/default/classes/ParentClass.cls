public abstract class ParentClass extends GrandparentClass{
    private String privateStringFromParent;
    /**
     * @description This is a protected string, use carefully.
     */
    protected String protectedStringFromParent;
    public String publicStringFromParent;

    public virtual String overridableMethod() {
        return '';
    }

    public virtual String overridableMethodOverridden() {
        return '';
    }
}
