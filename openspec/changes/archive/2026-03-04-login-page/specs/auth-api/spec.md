## MODIFIED Requirements

### Requirement: Auth feature barrel export
The system SHALL provide an `index.ts` barrel file in `src/features/auth/` that re-exports the auth API functions, all auth types, and the login page component for use by the router.

#### Scenario: Import from feature barrel
- **WHEN** a consumer imports from `@/features/auth`
- **THEN** `authApi`, `LoginRequest`, `TokenResponse`, `UserResponse`, `ChangePasswordRequest`, `ChangePasswordResponse`, and `LoginPage` are all available
