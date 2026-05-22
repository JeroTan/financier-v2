## ADDED Requirements

### Requirement: Auth route wrappers
Auth pages SHALL keep Astro route files as thin wrappers and delegate interactive UI to React components.

#### Scenario: Login route wrapper
- **WHEN** `/login` is requested
- **THEN** Astro serves the route shell and hydrates the React login UI as the page's primary content

#### Scenario: Register route wrapper
- **WHEN** `/register` is requested
- **THEN** Astro serves the route shell and hydrates the React register UI as the page's primary content

#### Scenario: Signup alias
- **WHEN** `/signup` is requested
- **THEN** the route redirects to `/register`

### Requirement: Auth route debug visibility
Auth page routing SHALL preserve browser-debuggable client behavior.

#### Scenario: Email auth does not navigate as document post
- **WHEN** a hydrated auth form is submitted
- **THEN** route handling stays on the current page until the JSON fetch succeeds and client navigation sends the user to `/dashboard`

#### Scenario: Auth page receives OAuth failure
- **WHEN** Google OAuth redirects back with failure information
- **THEN** an auth route can read the error query parameters and display them in React UI
