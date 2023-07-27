public class MemberGrouping {
    // @start-group Group old syntax
    public static final String inGroup1;
    public static final String anotherInGroup1;
    // @end-group

    /**
     * @start-group Group new syntax
     * @description Group's description
     */

    /** @description Description for constant in group 2 */
    public static final String inGroup2;
    /** @description Description for another constant in group 2 @future annotation */
    public static final String anotherInGroup2;
    /** @end-group */
}
