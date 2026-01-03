const CONVEX_FUNCTIONS = new Set([
  "query",
  "mutation",
  "action",
  "internalQuery",
  "internalMutation",
  "internalAction",
  "httpAction",
]);

const DB_METHODS = new Set(["get", "patch", "replace", "delete"]);

function isConvexRegistration(node) {
  if (node.callee?.type === "Identifier") {
    return CONVEX_FUNCTIONS.has(node.callee.name);
  }
  if (
    node.callee?.type === "CallExpression" &&
    node.callee.callee?.type === "Identifier"
  ) {
    return CONVEX_FUNCTIONS.has(node.callee.callee.name);
  }
  return false;
}

function isDbOperation(node) {
  if (node.type !== "MemberExpression") return false;
  if (node.property?.type !== "Identifier") return false;
  if (!DB_METHODS.has(node.property.name)) return false;

  const obj = node.object;
  if (
    obj?.type === "MemberExpression" &&
    obj.property?.type === "Identifier" &&
    obj.property.name === "db"
  ) {
    return true;
  }
  return false;
}

const noOldRegisteredFunctionSyntax = {
  meta: {
    type: "problem",
    docs: {
      description: "Prefer object syntax for registered Convex functions",
    },
    fixable: "code",
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isConvexRegistration(node)) return;

        const arg = node.arguments[0];
        if (!arg) return;

        if (
          arg.type === "ArrowFunctionExpression" ||
          arg.type === "FunctionExpression"
        ) {
          context.report({
            node: arg,
            message:
              "Use object syntax with 'handler' property instead of passing a function directly",
          });
        }
      },
    };
  },
};

const requireArgsValidator = {
  meta: {
    type: "problem",
    docs: {
      description: "Require argument validators for Convex functions",
    },
    fixable: "code",
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isConvexRegistration(node)) return;

        const config = node.arguments[0];
        if (!config || config.type !== "ObjectExpression") return;

        const hasHandler = config.properties.some(
          (p) =>
            p.type === "Property" &&
            p.key?.type === "Identifier" &&
            p.key.name === "handler"
        );
        if (!hasHandler) return;

        const hasArgs = config.properties.some(
          (p) =>
            p.type === "Property" &&
            p.key?.type === "Identifier" &&
            p.key.name === "args"
        );

        if (!hasArgs) {
          context.report({
            node: config,
            message: "Convex functions should have an 'args' validator",
          });
        }
      },
    };
  },
};

const explicitTableIds = {
  meta: {
    type: "problem",
    docs: {
      description: "Require explicit table names in database operations",
    },
    fixable: "code",
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee?.type !== "MemberExpression") return;
        if (!isDbOperation(node.callee)) return;

        const methodName = node.callee.property?.name;
        const args = node.arguments;

        if (methodName === "get" && args.length === 1) {
          context.report({
            node,
            message:
              "Use explicit table name: ctx.db.get(tableName, id) instead of ctx.db.get(id)",
          });
        }

        if (methodName === "patch" && args.length === 2) {
          context.report({
            node,
            message:
              "Use explicit table name: ctx.db.patch(tableName, id, updates) instead of ctx.db.patch(id, updates)",
          });
        }

        if (methodName === "replace" && args.length === 2) {
          context.report({
            node,
            message:
              "Use explicit table name: ctx.db.replace(tableName, id, doc) instead of ctx.db.replace(id, doc)",
          });
        }

        if (methodName === "delete" && args.length === 1) {
          context.report({
            node,
            message:
              "Use explicit table name: ctx.db.delete(tableName, id) instead of ctx.db.delete(id)",
          });
        }
      },
    };
  },
};

export default {
  meta: {
    name: "convex",
    version: "0.1.0",
  },
  rules: {
    "no-old-registered-function-syntax": noOldRegisteredFunctionSyntax,
    "require-args-validator": requireArgsValidator,
    "explicit-table-ids": explicitTableIds,
  },
};
