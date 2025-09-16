# ORBA.md

This file provides guidance to Orba (claude.ai/code) when working with code in this repository.

## Project Overview

Shuvi is a meta-framework similar to Next.js that creates applications quickly with automatic transpilation, hot reloading, code splitting, and server-side rendering. This is a monorepo managed with pnpm workspaces and Turborepo.

## Essential Commands

### Setup & Development
```bash
# Initial setup
pnpm i && pnpm build

# Development mode (all packages)
pnpm dev

# Run Shuvi CLI directly
pnpm shuvi

# Serve a specific directory/fixture
pnpm shuvi dev examples/basic
pnpm shuvi dev test/fixtures/basic
```

### Building & Testing
```bash
# Build all packages
pnpm build

# All tests
pnpm test

# Unit tests only (packages/)
pnpm test:unit

# E2E tests only (test/)
pnpm test:e2e

# Server-specific tests
pnpm test:e2e:express
pnpm test:e2e:koa

# Single package test
pnpm test:compiler
```

### Maintenance
```bash
# Clean all build artifacts
pnpm clean

# Format Rust code
pnpm format:rust

# Format TOML files
pnpm format:toml
```

## Architecture

### Core Framework Flow
1. **CLI** (`packages/shuvi/`) - Main entry point and command handling
2. **Compiler** (`packages/compiler/`) - Webpack/Babel build configuration  
3. **Runtime** (`packages/runtime/`) - Core application runtime components
4. **Router** (`packages/router/`) - Framework-agnostic routing logic
5. **Platform** (`packages/platform-web/`, `packages/platform-shared/`) - Platform-specific implementations

### Key Package Relationships
- `shuvi` assembles other packages and provides CLI interface
- `compiler` handles build tooling with webpack/babel configurations  
- `runtime` provides core runtime components for applications
- `router` + `router-react` handle routing (framework-agnostic + React-specific)
- `platform-*` packages provide platform-specific runtime utilities
- `toolpack` contains shared build configurations
- `shared`/`utils` provide utility functions across packages

### Build System
- **Turborepo** manages build pipeline with dependency graph
- **Multi-target builds**: Most packages build to both CJS (`lib/`) and ESM (`esm/`) 
- **TypeScript configs**: Base config in `tsconfig.base.json`, per-package configs for different build targets
- **Rust integration**: SWC compiler plugins for faster builds (`rust-packages/`)

## Testing Architecture

### Unit Tests
- Located within each package directory
- Use ts-jest with custom TypeScript configuration
- Run with `pnpm test:unit`

### E2E Tests  
- Located in `test/` directory using Jest + Puppeteer
- Test fixtures in `test/fixtures/` provide complete example applications
- Support both Express and Koa server testing
- Run with `--runInBand` for sequential execution to avoid port conflicts
- Custom filter script at `scripts/filter-e2e.js`

### Test Environment Variables
- `NODE_SERVER=EXPRESS|KOA` - Switch server implementations
- `NODE_ENV=production` - Test production builds  
- `BROWSERSLIST_IGNORE_OLD_DATA=true` - Ignore outdated browser data

## Development Notes

### Prerequisites
- Node.js >=16
- pnpm ^8.9.2  
- Rust/Cargo (for SWC compiler development)

### Monorepo Structure
- All packages in `packages/` directory
- Examples in `examples/` directory  
- E2E tests and fixtures in `test/` directory
- Build scripts in `scripts/` directory
- Rust packages in `rust-packages/` directory

### Server Support
Framework supports multiple server implementations - always test both:
- Express (traditional Node.js web framework)
- Koa (modern async/await middleware framework)

### Code Style
- Prettier configuration in `.prettierrc`
- Lint-staged runs formatting on commit via Husky
- No manual linting commands - handled automatically

### Common Development Tasks
1. **Adding new features**: Start with unit tests in the relevant package, then add E2E tests if needed
2. **Testing changes**: Run package-specific tests first, then full test suite  
3. **Building**: Use `pnpm build` to build all packages via Turborepo
4. **Debugging**: Use test fixtures like `test/fixtures/basic` for isolated testing