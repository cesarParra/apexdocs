---
title: StatusEnum
type: enum
generated: '2025-12-15T21:24:38.010Z'
template: custom
---

# StatusEnum

Enumeration representing different status states in a workflow process. 
This enum demonstrates various status transitions and provides utility methods 
for status validation and progression.

## Enum Values

### AWAITING_REVIEW
State when a process requires review or approval. 
Additional input is needed before proceeding.
### CANCELLED
State when a process has been canceled or terminated. 
This is a terminal state and cannot be resumed.
### COMPLETED
State when a process has been successfully completed. 
This is a terminal state.
### FAILED
State when a process has failed due to an error. 
This may require manual intervention to resolve.
### IN_PROGRESS
State when a process is actively being processed. 
Work is currently in progress.
### PAUSED
State when a process is paused temporarily. 
The process can be resumed from this state.
### PENDING
Initial state when a process is created but not yet started. 
The process is waiting for initial input or approval.

---

*Generated with custom enum template*