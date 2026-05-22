## ADDED Requirements

### Requirement: React Google OAuth entry
Google OAuth SHALL be started from the React auth UI with consistent visible state.

#### Scenario: Login Google button
- **WHEN** a user clicks the Google button on `/login`
- **THEN** the React UI disables auth controls and navigates the browser to `/api/auth/google`

#### Scenario: Register Google button
- **WHEN** a user clicks the Google button on `/register`
- **THEN** the React UI disables auth controls and navigates the browser to `/api/auth/google`

### Requirement: OAuth callback errors surface on auth UI
Google OAuth callback failures SHALL send users to an auth page that can display the error.

#### Scenario: Google denies consent
- **WHEN** Google redirects back with an OAuth error
- **THEN** the user lands on an auth page showing a readable Google sign-in failure message

#### Scenario: Google callback fails server-side
- **WHEN** token exchange, profile fetch, database access, or account linking fails
- **THEN** the user lands on an auth page showing a generic Google sign-in failure message
