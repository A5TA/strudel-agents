// Node module-resolution hook (registered from validate.mjs via node:module register()).
//
// Why this exists: @strudel/core's bundled dist statically imports
// `SalatRepl` from `@kabelsalat/web`. That package has no "exports" map and
// its "main" field points at dist/index.js, which is an IIFE browser bundle
// with no ESM exports — so importing @strudel/core in plain Node fails with
// "does not provide an export named 'SalatRepl'".
//
// The package DOES ship a proper ESM build at dist/index.mjs (the "module"
// field, which Node ignores). This hook redirects the bare specifier to it.
export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@kabelsalat/web') {
    return nextResolve('@kabelsalat/web/dist/index.mjs', context);
  }
  return nextResolve(specifier, context);
}
