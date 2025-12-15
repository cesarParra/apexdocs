/**
 * @description Enumeration representing different status states in a workflow process.
 * This enum demonstrates various status transitions and provides utility methods
 * for status validation and progression.
 *
 * @example
 * // Get the next status in the workflow
 * Status currentStatus = StatusEnum.PENDING;
 * Status nextStatus = currentStatus.next();
 *
 * // Check if a status is terminal
 * Boolean isTerminal = StatusEnum.COMPLETED.isTerminal();
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
    FAILED;

    /**
     * @description Gets the next logical status in the workflow progression.
     * Returns the appropriate next status based on the current status.
     * For terminal statuses, returns the same status.
     *
     * @return The next status in the workflow, or the current status if terminal.
     *
     * @example
     * // Returns StatusEnum.IN_PROGRESS
     * StatusEnum next = StatusEnum.PENDING.next();
     */
    public StatusEnum next() {
        switch on (this) {
            when PENDING {
                return IN_PROGRESS;
            }
            when IN_PROGRESS {
                return AWAITING_REVIEW;
            }
            when PAUSED {
                return IN_PROGRESS;
            }
            when AWAITING_REVIEW {
                return COMPLETED;
            }
            when else {
                // COMPLETED, CANCELLED, and FAILED are terminal
                return this;
            }
        }
    }

    /**
     * @description Checks if the current status is a terminal state.
     * Terminal states cannot transition to other statuses in the normal workflow.
     *
     * @return `true` if the status is terminal, `false` otherwise.
     *
     * @example
     * // Returns true
     * Boolean terminal = StatusEnum.COMPLETED.isTerminal();
     *
     * // Returns false
     * Boolean notTerminal = StatusEnum.PENDING.isTerminal();
     */
    public Boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED || this == FAILED;
    }

    /**
     * @description Gets a descriptive label for the status.
     * Returns a human-readable string representation of the status.
     *
     * @return A formatted label for the status.
     *
     * @example
     * // Returns "Pending"
     * String label = StatusEnum.PENDING.getLabel();
     */
    public String getLabel() {
        switch on (this) {
            when PENDING {
                return 'Pending';
            }
            when IN_PROGRESS {
                return 'In Progress';
            }
            when PAUSED {
                return 'Paused';
            }
            when AWAITING_REVIEW {
                return 'Awaiting Review';
            }
            when COMPLETED {
                return 'Completed';
            }
            when CANCELLED {
                return 'Cancelled';
            }
            when FAILED {
                return 'Failed';
            }
            when else {
                return 'Unknown';
            }
        }
    }

    /**
     * @description Validates if a transition from the current status to a target status is allowed.
     * Checks business rules for status transitions.
     *
     * @param targetStatus The status to transition to.
     * @return `true` if the transition is allowed, `false` otherwise.
     *
     * @example
     * // Returns true
     * Boolean valid = StatusEnum.PENDING.canTransitionTo(StatusEnum.IN_PROGRESS);
     *
     * // Returns false
     * Boolean invalid = StatusEnum.COMPLETED.canTransitionTo(StatusEnum.PENDING);
     */
    public Boolean canTransitionTo(StatusEnum targetStatus) {
        if (this.isTerminal()) {
            return false;
        }

        switch on (this) {
            when PENDING {
                return targetStatus == IN_PROGRESS || targetStatus == CANCELLED;
            }
            when IN_PROGRESS {
                return targetStatus == AWAITING_REVIEW || targetStatus == PAUSED || targetStatus == FAILED;
            }
            when PAUSED {
                return targetStatus == IN_PROGRESS || targetStatus == CANCELLED;
            }
            when AWAITING_REVIEW {
                return targetStatus == COMPLETED || targetStatus == IN_PROGRESS;
            }
            when else {
                return false;
            }
        }
    }
}
