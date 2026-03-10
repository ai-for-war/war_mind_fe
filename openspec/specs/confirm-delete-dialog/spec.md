# confirm-delete-dialog Specification

## Purpose
TBD - created by archiving change voice-clone-tts-ui. Update Purpose after archive.
## Requirements
### Requirement: ConfirmDeleteDialog component
The system SHALL provide a `ConfirmDeleteDialog` component at `src/components/common/confirm-delete-dialog.tsx` that wraps shadcn `AlertDialog` to confirm destructive actions. The component SHALL accept `open`, `onOpenChange`, `onConfirm`, `title`, `description`, and `isLoading` props.

#### Scenario: Dialog renders when open
- **WHEN** `ConfirmDeleteDialog` is rendered with `open={true}`
- **THEN** a modal dialog appears with the provided `title`, `description`, a "Cancel" button, and a "Delete" button styled as destructive

#### Scenario: Cancel closes dialog
- **WHEN** the user clicks "Cancel" or presses Escape
- **THEN** `onOpenChange(false)` is called and the dialog closes without triggering `onConfirm`

#### Scenario: Confirm triggers delete
- **WHEN** the user clicks the "Delete" button
- **THEN** `onConfirm` callback is invoked

#### Scenario: Loading state during delete
- **WHEN** `isLoading` is `true`
- **THEN** the "Delete" button shows a spinner, is disabled, and the "Cancel" button is also disabled to prevent closing during the operation

#### Scenario: Dialog closed state
- **WHEN** `ConfirmDeleteDialog` is rendered with `open={false}`
- **THEN** the dialog is not visible in the DOM

### Requirement: ConfirmDeleteDialog default text
When `title` or `description` are not provided, the dialog SHALL use default text: title "Are you sure?" and description "This action cannot be undone.".

#### Scenario: Default text
- **WHEN** `ConfirmDeleteDialog` is rendered without `title` and `description` props
- **THEN** the dialog displays "Are you sure?" as title and "This action cannot be undone." as description

#### Scenario: Custom text
- **WHEN** `ConfirmDeleteDialog` is rendered with `title="Delete voice?"` and `description="This will permanently remove the cloned voice."`
- **THEN** the dialog displays the custom title and description

