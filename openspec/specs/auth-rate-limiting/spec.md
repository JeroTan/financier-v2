# auth-rate-limiting Specification

## Purpose
TBD - created by archiving change auth-setup. Update Purpose after archive.
## Requirements
### Requirement: Login rate limiting
The system SHALL limit login attempts to 5 per 15 minutes per IP address.

#### Scenario: Rate limit enforced
- **WHEN** a user fails to log in 5 times within 15 minutes
- **THEN** subsequent login attempts are rejected with a RATE_LIMITED error

#### Scenario: Rate limit resets
- **WHEN** 15 minutes have passed since the first failed attempt
- **THEN** the rate limit counter resets and login attempts are allowed again

### Requirement: Registration rate limiting
The system SHALL limit registration attempts to 3 per 15 minutes per IP address.

#### Scenario: Registration rate limit enforced
- **WHEN** a user attempts to register 3 times within 15 minutes
- **THEN** subsequent registration attempts are rejected with a RATE_LIMITED error

### Requirement: Rate limit response
The system SHALL return a 429 Too Many Requests status with a RATE_LIMITED error code when rate limits are exceeded.

#### Scenario: Rate limit response
- **WHEN** a rate limit is exceeded
- **THEN** the response has status 429 with a RATE_LIMITED error and Retry-After header

