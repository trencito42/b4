/**
 * Type declaration for `@b4/react/styles.css` — the single stylesheet a
 * consumer imports once, alongside `@b4/tokens/css`.
 *
 * Same reason as `@b4/tokens/css`: the subpath resolves to a plain
 * stylesheet, so without a `types` condition in the package's export map
 * TypeScript rejects the documented import with TS2882. This
 * declaration makes the stylesheet importable from TypeScript exactly
 * like the JavaScript entry point.
 */
declare const b4ReactStylesheet: string;

export default b4ReactStylesheet;
