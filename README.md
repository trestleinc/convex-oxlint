# @trestleinc/convex-oxlint

Oxlint plugin with Convex-specific linting rules. A faster alternative to `@convex-dev/eslint-plugin`.

## Why?

- **50-100x faster** than ESLint
- Same rules as `@convex-dev/eslint-plugin`

## Installation

```bash
bun add -D @trestleinc/convex-oxlint oxlint
```

## Quick Setup

1. Create `oxlint.json` in your project root:

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "plugins": ["typescript", "import"],
  "jsPlugins": ["@trestleinc/convex-oxlint"],
  "rules": {
    "no-console": "warn",
    "no-debugger": "error",
    "eqeqeq": "error",
    "no-var": "error",
    "prefer-const": "error",
    "typescript/no-explicit-any": "off",
    "typescript/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "convex/no-old-registered-function-syntax": "error",
    "convex/require-args-validator": "error",
    "convex/explicit-table-ids": "error"
  },
  "ignorePatterns": [
    "**/dist/**",
    "**/_generated/**",
    "**/*.d.ts",
    "**/node_modules/**"
  ],
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.spec.ts"],
      "rules": {
        "no-console": "off"
      }
    }
  ]
}
```

2. Update your `package.json` scripts:

```json
{
  "scripts": {
    "build": "oxlint --fix && tsdown",
    "dev": "tsdown --watch",
    "clean": "rm -rf dist"
  }
}
```

3. Run:

```bash
bun run build
```

## Migrating from ESLint

1. Remove ESLint dependencies:

```bash
bun remove eslint typescript-eslint @convex-dev/eslint-plugin @stylistic/eslint-plugin globals
```

2. Add oxlint:

```bash
bun add -D @trestleinc/convex-oxlint oxlint
```

3. Delete `eslint.config.js`

4. Create `oxlint.json` (see Quick Setup above)

5. Update build script to `oxlint --fix && tsdown`

## Rules

### `convex/no-old-registered-function-syntax`

Prefer object syntax for registered Convex functions.

```typescript
// Bad
export const get = query(async (ctx) => {
  return ctx.db.query("users").collect();
});

// Good
export const get = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("users").collect();
  },
});
```

### `convex/require-args-validator`

Require `args` validator for Convex functions.

```typescript
// Bad
export const get = query({
  handler: async (ctx) => { ... },
});

// Good
export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => { ... },
});
```

### `convex/explicit-table-ids`

Require explicit table names in database operations (Convex 1.31+).

```typescript
// Bad
await ctx.db.get(id);
await ctx.db.patch(id, { name: "new" });
await ctx.db.replace(id, doc);
await ctx.db.delete(id);

// Good
await ctx.db.get("users", id);
await ctx.db.patch("users", id, { name: "new" });
await ctx.db.replace("users", id, doc);
await ctx.db.delete("users", id);
```

## Supported Function Types

The plugin recognizes all Convex function registration methods:

- `query` / `internalQuery`
- `mutation` / `internalMutation`
- `action` / `internalAction`
- `httpAction`

## License

MIT
