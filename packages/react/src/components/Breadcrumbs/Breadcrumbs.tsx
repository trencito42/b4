import type { ReactNode } from "react";
import { Link } from "../Link/Link.js";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  /** Required — the breadcrumb trail has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

const ChevronIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path d="m6 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * `<nav>` + ordered list, not a flat row of spans — real breadcrumb
 * semantics. The last item renders as plain text with
 * `aria-current="page"` (it's where the user already is, not a link to
 * click); earlier items with an `href` render as real `Link`s, items
 * without one render as plain text (e.g. a non-navigable ellipsis-style
 * ancestor).
 */
export function Breadcrumbs({ items, className, ...rest }: BreadcrumbsProps) {
  return (
    <nav className={["b4-breadcrumbs", className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <ol className="b4-breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li className="b4-breadcrumbs__item" key={index}>
              {isLast ? (
                <span className="b4-breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link href={item.href} tone="neutral" className="b4-breadcrumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span className="b4-breadcrumbs__text">{item.label}</span>
              )}
              {!isLast && (
                <span className="b4-breadcrumbs__separator" aria-hidden="true">
                  {ChevronIcon}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
