## ADDED Requirements

### Requirement: JWT token creation
The system SHALL create JWT access tokens with RS256 signing, containing user_id, email, and expiration (15-30 minutes).

#### Scenario: Access token created
- **WHEN** a user successfully logs in
- **THEN** a signed JWT access token is generated and returned

#### Scenario: Token contains required claims
- **WHEN** a JWT is created
- **THEN** it contains sub (user_id), email, iat, and exp claims

### Requirement: JWT token validation
The system SHALL validate JWT tokens using the RS256 public key, checking signature, expiration, and required claims.

#### Scenario: Valid token
- **WHEN** a valid, unexpired JWT is presented
- **THEN** the token is accepted and the user is authenticated

#### Scenario: Expired token
- **WHEN** an expired JWT is presented
- **THEN** the token is rejected with an UNAUTHORIZED error

#### Scenario: Invalid signature
- **WHEN** a JWT with an invalid signature is presented
- **THEN** the token is rejected with an AUTHENTICATION error

### Requirement: Refresh token management
The system SHALL issue refresh tokens alongside access tokens. Refresh tokens SHALL be stored in HttpOnly, Secure cookies.

#### Scenario: Refresh token issued
- **WHEN** a user logs in
- **THEN** a refresh token is set as an HttpOnly, Secure cookie

#### Scenario: Access token refreshed
- **WHEN** the access token expires and the refresh token is valid
- **THEN** a new access token is issued

### Requirement: Token revocation
The system SHALL maintain a token revocation list in Workers KV. Revoked refresh tokens SHALL be rejected.

#### Scenario: Token revoked on logout
- **WHEN** a user logs out
- **THEN** their refresh token is added to the KV revocation list

#### Scenario: Revoked token rejected
- **WHEN** a revoked refresh token is used
- **THEN** the request is rejected with an UNAUTHORIZED error
