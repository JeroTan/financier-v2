## ADDED Requirements

### Requirement: Users auth columns
The users table SHALL include all columns used by auth and settings repositories.

#### Scenario: Password auth columns
- **WHEN** email/password auth stores credentials
- **THEN** `password_hash` and `password_salt` columns are available

#### Scenario: Refresh token column
- **WHEN** refresh tokens are issued or rotated
- **THEN** the `refresh_token` column is available and updated for the user

#### Scenario: Preference columns
- **WHEN** user settings are loaded or updated
- **THEN** `personality` and `theme` columns are available
