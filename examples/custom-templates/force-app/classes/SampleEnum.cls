/**
 * @description This is a sample enum. This references {@link ReferencedEnum}.
 *
 * This description has several lines
 * @group Sample Enums
 * @author John Doe
 * @date 2022-01-01
 * @some-custom Test. I can also have a {@link ReferencedEnum} here.
 *                    And it can be multiline.
 * @see ReferencedEnum
 * @mermaid
 * graph TD
 *  A[SampleEnum] -->|references| B[ReferencedEnum]
 *  B -->|referenced by| A
 */
@NamespaceAccessible
public enum SampleEnum {
    /**
     * @description This is value 1
     */
    VALUE1,
    /**
     * @description This is value 2
     */
    VALUE2,
    /**
     * @description This is value 3
     */
    VALUE3
}
