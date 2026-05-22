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

### Requirement: Stale users table repair
Auth and settings queries SHALL repair missing `users` columns before repository operations against D1.

#### Scenario: Existing database missing preference columns
- **WHEN** register, login, Google auth, refresh, or settings code touches a D1 `users` table missing `personality` or `theme`
- **THEN** the repository adds the missing columns with non-null defaults before the query continues

#### Scenario: Existing database missing token columns
- **WHEN** auth code touches a D1 `users` table missing `password_salt` or `refresh_token`
- **THEN** the repository adds the missing columns before credential or refresh-token queries continue

#### Scenario: Concurrent repair
- **WHEN** two requests attempt the same repair
- **THEN** duplicate-column errors do not permanently poison future auth attempts
