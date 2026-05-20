## ADDED Requirements

### Requirement: Astro auth endpoint compatibility
The system SHALL serve email/password auth endpoints at the nested Astro routes used by the UI and OpenAPI docs.

#### Scenario: Login route exists
- **WHEN** a POST request is made to `/api/auth/login`
- **THEN** the login handler processes the request instead of returning 404

#### Scenario: Register route exists
- **WHEN** a POST request is made to `/api/auth/register`
- **THEN** the register handler processes the request instead of returning 404

### Requirement: Auth request format compatibility
Login and registration SHALL accept both JSON requests and standard HTML form posts.

#### Scenario: JSON login
- **WHEN** a JSON login request contains valid credentials
- **THEN** the response returns auth data as JSON and sets the refresh token cookie

#### Scenario: Form login
- **WHEN** an HTML form login post contains valid credentials
- **THEN** the response sets the refresh token cookie and redirects to `/dashboard`

#### Scenario: Form validation error
- **WHEN** an HTML form auth post contains invalid input
- **THEN** the user receives a non-success response without creating a session
