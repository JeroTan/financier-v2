# rate-limit-config Specification

## Purpose
TBD - created by archiving change api-rate-limiting. Update Purpose after archive.
## Requirements
### Requirement: Rate limit configuration
The system SHALL define rate limit configuration per endpoint category with separate values for development and production environments.

| Category    | Development (req/min) | Production (req/min) |
|-------------|----------------------|---------------------|
| chat        | 30                   | 20                  |
| data-write  | 60                   | 30                  |
| data-read   | 120                  | 60                  |
| settings    | 30                   | 15                  |

#### Scenario: Development limits applied
- **WHEN** `CLOUDFLARE_ENV` is `development`
- **THEN** the development rate limits are used

#### Scenario: Production limits applied
- **WHEN** `CLOUDFLARE_ENV` is `production` or undefined
- **THEN** the production rate limits are used

### Requirement: Environment detection
The system SHALL detect the environment from `CLOUDFLARE_ENV` (set by `cross-env` in `package.json` scripts) to select the appropriate rate limit tier.

#### Scenario: Environment detected
- **WHEN** the middleware initializes
- **THEN** it reads `CLOUDFLARE_ENV` and selects the matching rate limit configuration

