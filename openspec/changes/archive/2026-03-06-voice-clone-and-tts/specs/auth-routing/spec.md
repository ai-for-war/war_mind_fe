## MODIFIED Requirements

### Requirement: Voice Cloning route
The router SHALL define a protected route at path `/voice-cloning` that renders the Voice Cloning page component from `@/features/voice-cloning`. This route SHALL be nested under the `MainLayout`.

#### Scenario: Navigate to /voice-cloning
- **WHEN** an authenticated user navigates to `/voice-cloning`
- **THEN** the Voice Cloning page is rendered inside the `MainLayout`

## ADDED Requirements

### Requirement: TTS route
The router SHALL define a protected route at path `/tts` that renders the TTS page component from `@/features/tts`. This route SHALL be nested under the `MainLayout`, alongside the existing `/voice-cloning` and `/multi-agent` routes.

#### Scenario: Navigate to /tts
- **WHEN** an authenticated user navigates to `/tts`
- **THEN** the TTS page is rendered inside the `MainLayout`

#### Scenario: Unauthenticated user accesses /tts
- **WHEN** an unauthenticated user navigates to `/tts`
- **THEN** they are redirected to `/login` with `/tts` stored in location state
