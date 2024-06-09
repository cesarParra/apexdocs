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
    String sampleMethod();
    String sampleMethodWithParams(String param1, Integer param2);
}
