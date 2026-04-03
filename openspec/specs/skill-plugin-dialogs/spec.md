## Purpose
Define modal workflows for viewing and managing skill plugins from the Skill Plugins page.
## Requirements
### Requirement: Skill detail popup
The system SHALL provide a skill detail popup for a selected skill from the `/skill-plugins` page. The popup SHALL present the selected skill's name, description, activation prompt, allowed tools, version, current-organization enablement state, and action affordances for edit, enable/disable, and delete.

#### Scenario: Open detail popup for selected skill
- **WHEN** the user selects a skill from the list page
- **THEN** the popup opens and displays that skill's persisted details and management actions

#### Scenario: Close detail popup without mutation
- **WHEN** the user closes the detail popup without triggering any action
- **THEN** the popup closes and the user remains on the `/skill-plugins` page with the list still visible

### Requirement: Create and edit skill popup form
The system SHALL provide popup forms for both creating and editing a skill. The form surface SHALL expose controls for `name`, `description`, `activation_prompt`, and `allowed_tool_names`, and the selectable tools SHALL be sourced from the runtime tool catalog rather than a hardcoded frontend list.

#### Scenario: Open create popup
- **WHEN** the user activates `New Skill`
- **THEN** a create-skill popup opens with empty form fields and available tool selections loaded from the tool catalog

#### Scenario: Open edit popup from detail popup
- **WHEN** the user activates `Edit` for an existing skill
- **THEN** an edit popup opens with that skill's current persisted values prefilled

#### Scenario: Save create or edit request successfully
- **WHEN** the user submits a valid create or edit form and the API request succeeds
- **THEN** the popup closes and the page reflects the saved skill state in the list

#### Scenario: Save request fails
- **WHEN** the create or edit request fails validation or returns an API error
- **THEN** the popup remains open, preserves the user's inputs, and displays the failure state

### Requirement: Enablement controls are scoped to the active organization
The skill management popup SHALL allow users to enable or disable a skill for the active organization without changing the skill's content fields. The popup SHALL reflect the current `is_enabled` state returned for the active organization scope.

#### Scenario: Enable a disabled skill
- **WHEN** the selected skill is disabled and the user activates enable
- **THEN** the enable action is sent for that skill in the active organization scope and the list reflects the enabled state after success

#### Scenario: Disable an enabled skill
- **WHEN** the selected skill is enabled and the user activates disable
- **THEN** the disable action is sent for that skill in the active organization scope and the list reflects the disabled state after success

### Requirement: Delete workflow requires explicit confirmation
The system SHALL require explicit confirmation before permanently deleting a skill. The delete confirmation SHALL distinguish deletion from disablement and SHALL only remove the skill after the user confirms the destructive action.

#### Scenario: Confirm delete
- **WHEN** the user confirms deletion from the delete confirmation popup
- **THEN** the selected skill is deleted and removed from the list after the request succeeds

#### Scenario: Cancel delete
- **WHEN** the user cancels the delete confirmation popup
- **THEN** no delete request is sent and the selected skill remains unchanged
