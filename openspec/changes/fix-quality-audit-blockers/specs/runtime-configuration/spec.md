## ADDED Requirements

### Requirement: Environment variable contract
The project SHALL document and consume all required runtime variables consistently across local, development, and production environments.

#### Scenario: Example env is complete
- **WHEN** a developer copies `.env.example` to `.env`
- **THEN** all locally required variables are present, including `APP_URL`, Google OAuth values, password pepper, and JWT secrets

#### Scenario: Production secrets are documented
- **WHEN** production deployment instructions are followed
- **THEN** required secrets for Google OAuth, password pepper, and JWT signing are configured through Cloudflare secrets

### Requirement: Cloudflare binding contract
Wrangler configuration SHALL define all bindings required by Astro and application code with non-placeholder IDs for active environments.

#### Scenario: Bindings are present
- **WHEN** the Worker starts
- **THEN** D1, KV token revocation, KV rate limiter, R2 storage, AI, assets, and any Astro-required session/image bindings are available or explicitly disabled

#### Scenario: Development bindings are remote
- **WHEN** development Wrangler configuration is validated
- **THEN** Cloudflare-backed bindings for D1, KV, R2, AI, sessions, and images use remote Cloudflare resources by default
- **AND** bindings without explicit remote behavior are not accepted as the default development workflow

#### Scenario: Placeholder IDs rejected
- **WHEN** deployment configuration is validated
- **THEN** placeholder KV IDs such as `replace-with-*` are treated as invalid

### Requirement: Deployment environment names
Wrangler environment names SHALL match the Financier application and target environment.

#### Scenario: Production name is correct
- **WHEN** production deployment runs
- **THEN** the Worker name identifies Financier production and not an unrelated application
