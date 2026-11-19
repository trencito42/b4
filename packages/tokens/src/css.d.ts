/**
 * Type declaration for B4's CSS entry points
 * (`@b4/tokens/css`, `@b4/tokens/css/graphite`, `@b4/tokens/css/porcelain`).
 *
 * These subpaths resolve to plain stylesheets, so without a `types`
 * condition in the package's export map TypeScript refuses the import
 * with TS2882 ("Cannot find module or type declarations for side-effect
 * import"). That makes the documented one-liner
 *
 *   import "@b4/tokens/css";
 *
 * unusable in any consumer that typechecks — which is every consumer
 * worth having. This declaration exists so the stylesheet is importable
 * from TypeScript exactly like the JavaScript entry point.
 */
declare const b4TokensStylesheet: string;

export default b4TokensStylesheet;
