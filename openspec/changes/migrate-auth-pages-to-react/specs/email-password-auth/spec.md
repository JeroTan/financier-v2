## ADDED Requirements

### Requirement: Client-side email/password submission
The system SHALL support email/password login and registration through JSON fetch requests from the React auth UI.

#### Scenario: Login JSON request
- **WHEN** the React login form submits an email and password
- **THEN** it sends `Content-Type: application/json` to `/api/auth/login` and parses the JSON response

#### Scenario: Registration JSON request
- **WHEN** the React register form submits an email and password
- **THEN** it sends `Content-Type: application/json` to `/api/auth/register` and parses the JSON response

#### Scenario: Access token available after success
- **WHEN** login or registration succeeds and the response contains an access token
- **THEN** the client stores it using the existing authenticated API token mechanism before navigating to `/dashboard`

### Requirement: Client-side email/password errors
The React auth UI SHALL map email/password API error codes to user-visible messages.

#### Scenario: Duplicate registration email
- **WHEN** `/api/auth/register` returns `EMAIL_EXISTS`
- **THEN** the register page displays an inline duplicate-email message without navigating away

#### Scenario: Invalid login credentials
- **WHEN** `/api/auth/login` returns `INVALID_CREDENTIALS`
- **THEN** the login page displays a generic invalid-credentials message without exposing whether the email exists

#### Scenario: Rate limited auth request
- **WHEN** an auth endpoint returns `RATE_LIMITED`
- **THEN** the auth page displays a rate-limit message and preserves entered email

#### Scenario: Server auth failure
- **WHEN** an auth endpoint returns an unexpected non-success response
- **THEN** the auth page displays a generic failure message and leaves controls usable after the request completes
