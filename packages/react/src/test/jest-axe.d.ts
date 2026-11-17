// jest-axe ships Jest matcher typings only. This augments Vitest's own
// `Assertion` interface so `expect(results).toHaveNoViolations()` type-checks
// under Vitest too.
declare module "vitest" {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
}

export {};
