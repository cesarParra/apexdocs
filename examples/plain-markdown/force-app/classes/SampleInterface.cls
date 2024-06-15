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
 */
@NamespaceAccessible
public interface SampleInterface extends ParentInterface {
    /**
     * @description This is a sample method
     * @return Some return value
     * @throws SampleException This is a sample exception
     */
    String sampleMethod();

    /**
     * @description This is a sample method with parameters
     * @param param1 This is the first parameter
     * @param param2 This is the second parameter
     * @return Some return value
     */
    @Deprecated
    SampleEnum sampleMethodWithParams(String param1, Integer param2);
}
