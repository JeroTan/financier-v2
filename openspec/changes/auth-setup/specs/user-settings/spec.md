## ADDED Requirements

### Requirement: Change password
The system SHALL allow authenticated users to change their password by providing their current password and a new password.

#### Scenario: Password changed successfully
- **WHEN** a user provides correct current password and a valid new password
- **THEN** the password is updated and a success response is returned

#### Scenario: Incorrect current password
- **WHEN** a user provides an incorrect current password
- **THEN** an AUTHENTICATION error is returned

#### Scenario: Invalid new password
- **WHEN** a user provides a new password shorter than 8 characters
- **THEN** a VALIDATION error is returned

### Requirement: Appearance preference
The system SHALL store the user's appearance preference (dark/light mode) and return it on login.

#### Scenario: Theme preference saved
- **WHEN** a user updates their theme preference
- **THEN** the preference is saved and returned on subsequent logins

#### Scenario: Default theme
- **WHEN** a user has no theme preference set
- **THEN** the default theme (light mode) is returned

### Requirement: Get user profile
The system SHALL provide an endpoint for authenticated users to retrieve their profile information.

#### Scenario: Profile retrieved
- **WHEN** an authenticated user requests their profile
- **THEN** their email, linked accounts, and preferences are returned
