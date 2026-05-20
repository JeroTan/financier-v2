## ADDED Requirements

### Requirement: shadcn/ui initialization
The system SHALL initialize shadcn/ui with the `new-york` style variant, configured for Tailwind CSS v4 compatibility.

#### Scenario: shadcn/ui installed
- **WHEN** the project is built
- **THEN** shadcn/ui components are available in `src/components/ui/`

### Requirement: Base shadcn components
The system SHALL install the following base shadcn/ui components: Button, Input, Card, Tabs, Progress, Avatar, Dialog, DropdownMenu, Select, Label, Textarea, Switch, Separator, Skeleton, Toast, Badge, and Tooltip.

#### Scenario: Components available
- **WHEN** a feature imports a shadcn component
- **THEN** the component is available and renders correctly

### Requirement: Tailwind CSS v4 compatibility
The system SHALL configure shadcn/ui to work with Tailwind CSS v4's `@theme` directive and CSS variable-based design tokens.

#### Scenario: Tailwind v4 tokens work
- **WHEN** a shadcn component uses a Tailwind utility class
- **THEN** the class resolves to the correct CSS variable value
