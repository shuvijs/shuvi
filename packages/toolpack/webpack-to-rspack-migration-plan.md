# Shuvi Toolpack: Webpack → Rspack Migration Plan

## Overview

This document outlines a plan to migrate the `@shuvi/toolpack` package from Webpack to Rspack with **zero breaking changes**, ensuring full backward compatibility.

## Background

- **Current State**: Built on Webpack 5.73.0
- **Goal**: Migrate to Rspack for improved build performance
- **Constraint**: No breaking changes at the API level; external usage must remain fully compatible

## Requirements

### 1. Preserve Public API

- All existing exports, function signatures, and config structures must remain **unchanged**
- No updates required from external users

### 2. Internal Replacement

- Internally replace all Webpack-related logic with the **equivalent Rspack implementation**
- Reuse existing abstractions where possible to simplify the migration

### 3. Compatibility Layer

- For features not yet supported by Rspack:

  - Provide a **shim or fallback implementation**
  - Or use an **equivalent alternative**

- Ensure behavior consistency before and after migration
