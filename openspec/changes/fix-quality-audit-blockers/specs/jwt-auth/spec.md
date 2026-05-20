## ADDED Requirements

### Requirement: Consistent token lifecycle
The system SHALL keep access token and refresh token responsibilities distinct.

#### Scenario: Tokens issued
- **WHEN** a user logs in or registers successfully
- **THEN** the system issues a signed access JWT and a refresh token

#### Scenario: Refresh token persisted
- **WHEN** a refresh token is issued
- **THEN** it is stored server-side for the user and set in an HttpOnly Secure cookie named consistently across the app

#### Scenario: Access token validates API auth
- **WHEN** an API request presents `Authorization: Bearer <access JWT>`
- **THEN** the system validates the JWT signature, expiration, and required claims

#### Scenario: Refresh token is not decrypted as JWT
- **WHEN** middleware reads the refresh token cookie
- **THEN** it does not attempt to decrypt the random refresh token as an access JWT

### Requirement: Refresh flow
The system SHALL exchange a valid refresh token for a new access token and refresh token.

#### Scenario: Valid refresh
- **WHEN** `/api/auth/refresh` receives a valid non-revoked refresh token
- **THEN** it returns a new access token and rotates the refresh token cookie

#### Scenario: Invalid refresh
- **WHEN** `/api/auth/refresh` receives an unknown or revoked refresh token
- **THEN** it returns an unauthorized JSON error and clears unusable session state
