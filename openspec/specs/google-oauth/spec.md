# google-oauth Specification

## Purpose
TBD - created by archiving change auth-setup. Update Purpose after archive.
## Requirements
### Requirement: Google OAuth authorization flow
The system SHALL implement the OAuth 2.0 authorization code flow with Google as the identity provider.

#### Scenario: OAuth redirect
- **WHEN** a user clicks "Sign in with Google"
- **THEN** they are redirected to Google's authorization page

#### Scenario: OAuth callback
- **WHEN** Google redirects back with an authorization code
- **THEN** the system exchanges the code for tokens and retrieves the user's profile

### Requirement: User creation on first OAuth login
The system SHALL create a new user record when a Google user logs in for the first time.

#### Scenario: First-time Google login
- **WHEN** a Google user's email is not in the database
- **THEN** a new user record is created with their google_id and email

### Requirement: Account linking
The system SHALL link a Google account to an existing user record if the email addresses match.

#### Scenario: Email matches existing user
- **WHEN** a Google user's email matches an existing email/password user
- **THEN** the google_id is added to the existing user record

#### Scenario: Account already linked
- **WHEN** a Google user's google_id is already associated with a user
- **THEN** the user is logged in to that account

### Requirement: Google account unlinking
The system SHALL allow users to unlink their Google account from their profile.

#### Scenario: Google account unlinked
- **WHEN** a user with both email/password and Google login unlinks Google
- **THEN** the google_id is removed from their user record

