# email-password-auth Specification

## Purpose
TBD - created by archiving change auth-setup. Update Purpose after archive.
## Requirements
### Requirement: Email/password registration
The system SHALL allow users to register with an email and password. Passwords SHALL be hashed before storage.

#### Scenario: Successful registration
- **WHEN** a user submits a valid email and password
- **THEN** a user record is created with a hashed password and JWT tokens are returned

#### Scenario: Duplicate email
- **WHEN** a user registers with an email that already exists
- **THEN** a CONFLICT error is returned

#### Scenario: Weak password
- **WHEN** a user registers with a password shorter than 8 characters
- **THEN** a VALIDATION error is returned

### Requirement: Email/password login
The system SHALL allow registered users to log in with their email and password.

#### Scenario: Successful login
- **WHEN** a user submits correct credentials
- **THEN** JWT access and refresh tokens are returned

#### Scenario: Incorrect password
- **WHEN** a user submits an incorrect password
- **THEN** an AUTHENTICATION error is returned

#### Scenario: User not found
- **WHEN** a user submits an email that is not registered
- **THEN** an AUTHENTICATION error is returned (same message as incorrect password to prevent enumeration)

