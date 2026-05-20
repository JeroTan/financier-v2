## ADDED Requirements

### Requirement: Create user
The system SHALL provide a `createUser` method that inserts a new user with email, optional password_hash, and optional google_id.

#### Scenario: Email/password user created
- **WHEN** `createUser` is called with email and password_hash
- **THEN** a user row is inserted

#### Scenario: OAuth user created
- **WHEN** `createUser` is called with email and google_id
- **THEN** a user row is inserted with null password_hash

### Requirement: Get user by email
The system SHALL provide a `getUserByEmail` method that returns a user by their email address.

#### Scenario: User found by email
- **WHEN** `getUserByEmail` is called with a registered email
- **THEN** the user is returned with password_hash (for login validation)

#### Scenario: User not found
- **WHEN** `getUserByEmail` is called with an unregistered email
- **THEN** null is returned

### Requirement: Get user by Google ID
The system SHALL provide a `getUserByGoogleId` method that returns a user by their Google OAuth ID.

#### Scenario: OAuth user found
- **WHEN** `getUserByGoogleId` is called with a registered google_id
- **THEN** the user is returned

### Requirement: Update user settings
The system SHALL provide an `updateUserSettings` method that updates user preferences (appearance theme, etc.).

#### Scenario: Theme updated
- **WHEN** `updateUserSettings` is called with a new theme preference
- **THEN** the user's settings are updated

### Requirement: Update password
The system SHALL provide an `updatePassword` method that updates a user's password_hash.

#### Scenario: Password updated
- **WHEN** `updatePassword` is called with a new hashed password
- **THEN** the user's password_hash is updated
