/**
 * @description Enumeration representing different status states in a workflow process.
 * This enum demonstrates various status transitions and provides utility methods
 * for status validation and progression.
 *
 * @author Example User
 * @since v1.0.0
 */
public enum StatusEnum {
    /**
     * @description Initial state when a process is created but not yet started.
     * The process is waiting for initial input or approval.
     */
    PENDING,

    /**
     * @description State when a process is actively being processed.
     * Work is currently in progress.
     */
    IN_PROGRESS,

    /**
     * @description State when a process is paused temporarily.
     * The process can be resumed from this state.
     */
    PAUSED,

    /**
     * @description State when a process requires review or approval.
     * Additional input is needed before proceeding.
     */
    AWAITING_REVIEW,

    /**
     * @description State when a process has been successfully completed.
     * This is a terminal state.
     */
    COMPLETED,

    /**
     * @description State when a process has been canceled or terminated.
     * This is a terminal state and cannot be resumed.
     */
    CANCELLED,

    /**
     * @description State when a process has failed due to an error.
     * This may require manual intervention to resolve.
     */
    FAILED
}
