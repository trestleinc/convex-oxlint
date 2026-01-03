# @trestleinc/convex-oxlint

Oxlint plugin with Convex-specific linting rules. A faster alternative to `@convex-dev/eslint-plugin`.

## Installation

```bash
bun add -D @trestleinc/convex-oxlint oxlint
```

## Usage

Add to your `oxlint.json`:

```json
{
  "jsPlugins": ["@trestleinc/convex-oxlint"],
  "rules": {
    "convex/no-old-registered-function-syntax": "error",
    "convex/require-args-validator": "error",
    "convex/explicit-table-ids": "error"
  }
}
```

## Rules

### `convex/no-old-registered-function-syntax`

Prefer object syntax for registered Convex functions.

```typescript
// Bad
export const get = query(async (ctx) => { ... });

// Good
export const get = query({
  args: {},
  handler: async (ctx) => { ... },
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

Require explicit table names in database operations.

```typescript
// Bad
await ctx.db.get(id);
await ctx.db.delete(id);

// Good
await ctx.db.get("users", id);
await ctx.db.delete("users", id);
```

## License

MIT
