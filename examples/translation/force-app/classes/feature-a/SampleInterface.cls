/**
 * @description This is a sample interface
 * @author John Doe
 * @date 2020-01-01
 * @see SampleEnum
 * @see ReferencedEnum
 * @mermaid
 * graph TD
 *    A[SampleInterface] -->|extends| B[ParentInterface]
 *    B -->|extends| C[GrandParentInterface]
 *    C -->|extends| D[GreatGrandParentInterface]
 * @example
 * SampleInterface sampleInterface = new SampleInterface();
 * sampleInterface.sampleMethod();
 */
@NamespaceAccessible
public interface SampleInterface extends ParentInterface {
    /**
     * @description This is a sample method
     * @return Some return value
     * @throws SampleException This is a sample exception
     * @throws AnotherSampleException This is another sample exception
     * @custom-tag This is a custom tag
     * @another-custom-tag This is another custom tag
     * @mermaid
     * graph TD
     *   A[SampleInterface] -->|extends| B[ParentInterface]
     *   B -->|extends| C[GrandParentInterface]
     *   C -->|extends| D[GreatGrandParentInterface]
     * @example
     * SampleInterface sampleInterface = new SampleInterface();
     * sampleInterface.sampleMethod();
     */
    String sampleMethod();

    /**
     * @description This is a sample method with parameters
     *              Sometimes it won't be possible to find a {@link NonExistent} link.
     * @param param1 This is the first parameter
     * @param param2 This is the second parameter
     * @param theEnum This is an enum parameter
     * @return Some return value
     */
    @Deprecated
    SampleEnum sampleMethodWithParams(String param1, Integer param2, SampleEnum theEnum);
}
