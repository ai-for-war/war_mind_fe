## ADDED Requirements

### Requirement: Login page renders a centered card form
The system SHALL render a login page at the `/login` route consisting of a centered card on a full-viewport dark background. The card SHALL contain the application logo/title, an email input, a password input, and a submit button.

#### Scenario: Page loads at /login
- **WHEN** the user navigates to `/login`
- **THEN** a centered card is displayed with the heading "War Mind", an email field, a password field, and a "Sign in" button

### Requirement: Email field with validation
The login form SHALL include an email input field with a visible label "Email". The field SHALL validate that the value is a non-empty valid email address. Validation SHALL run on form submission (not on each keystroke).

#### Scenario: Empty email on submit
- **WHEN** the user submits the form with an empty email field
- **THEN** an error message "Email is required" is displayed below the email input

#### Scenario: Invalid email format on submit
- **WHEN** the user submits the form with "notanemail" in the email field
- **THEN** an error message "Invalid email address" is displayed below the email input

#### Scenario: Valid email on submit
- **WHEN** the user submits the form with "user@example.com" in the email field
- **THEN** no validation error is shown for the email field

### Requirement: Password field with validation and visibility toggle
The login form SHALL include a password input field with a visible label "Password". The field SHALL validate that the value is non-empty. A toggle button SHALL allow the user to show or hide the password text.

#### Scenario: Empty password on submit
- **WHEN** the user submits the form with an empty password field
- **THEN** an error message "Password is required" is displayed below the password input

#### Scenario: Toggle password visibility
- **WHEN** the user clicks the password visibility toggle
- **THEN** the input type changes from "password" to "text" (or vice versa) and the toggle icon updates accordingly

### Requirement: Form submission triggers login flow
The login form SHALL call `authApi.loginWithUser()` with the submitted email and password when validation passes. During the API call, the submit button SHALL display a loading state and be disabled.

#### Scenario: Successful login
- **WHEN** the user submits valid credentials and the API returns success
- **THEN** the auth store is updated with the token and user data, and the user is navigated to the main application route `/`

#### Scenario: Loading state during submission
- **WHEN** the form is submitted and the API call is in progress
- **THEN** the submit button shows a loading indicator and is disabled, and all form inputs are disabled

#### Scenario: Failed login with API error
- **WHEN** the user submits credentials and the API returns an error (e.g., 401 invalid credentials)
- **THEN** an error message is displayed above the form (e.g., "Invalid email or password") and the form remains editable

### Requirement: AuthLayout provides centered layout for auth pages
The system SHALL provide an `AuthLayout` component that renders a full-viewport container with dark background, centering its children both horizontally and vertically. This layout SHALL be reused for future auth-related pages.

#### Scenario: AuthLayout renders children centered
- **WHEN** a component is rendered inside `AuthLayout`
- **THEN** the component is centered horizontally and vertically within a full-height viewport

### Requirement: Authenticated users are redirected away from login
The login page SHALL check if the user is already authenticated. If `useAuthStore.isAuthenticated` is `true`, the user SHALL be redirected to `/` immediately.

#### Scenario: Authenticated user visits /login
- **WHEN** a user with a valid token in storage navigates to `/login`
- **THEN** the user is redirected to `/` without seeing the login form

### Requirement: Accessible form markup
All form inputs SHALL have associated visible labels using `htmlFor`/`id` attributes. Error messages SHALL use `role="alert"` for screen reader announcement. The form SHALL be navigable via keyboard (Tab between fields, Enter to submit).

#### Scenario: Keyboard navigation
- **WHEN** the user presses Tab on the login form
- **THEN** focus moves sequentially through email input, password input, password toggle, and submit button

#### Scenario: Screen reader announces errors
- **WHEN** a validation error appears
- **THEN** the error message element has `role="alert"` so screen readers announce it immediately
