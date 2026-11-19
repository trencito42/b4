import { forwardRef, type ElementType, type ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** A `Breadcrumbs` element, typically. Rendered above the title. */
  breadcrumbs?: ReactNode;
  /** Buttons/controls, typically a `Button`/`ButtonGroup`. Rendered at the trailing edge, aligned with the title. */
  actions?: ReactNode;
  /** The real heading level to render `title` as — defaults to `1` (this is usually the page's one true `<h1>`). Override in a nested context (e.g. inside a panel) where an `<h1>` would be wrong. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/**
 * The title block at the top of a page's content area — composes
 * `Breadcrumbs` and `Button`/`ButtonGroup` rather than reimplementing
 * either. Distinct from `AppShell`'s `header` slot (that one is
 * persistent app chrome — a top bar — this one is page content, and
 * scrolls with it).
 */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader(
  { title, description, breadcrumbs, actions, headingLevel = 1, className },
  ref,
) {
  const Heading = `h${headingLevel}` as ElementType;

  return (
    <div ref={ref} className={["b4-page-header", className ?? ""].filter(Boolean).join(" ")}>
      {breadcrumbs && <div className="b4-page-header__breadcrumbs">{breadcrumbs}</div>}
      <div className="b4-page-header__row">
        <div className="b4-page-header__heading">
          <Heading className="b4-page-header__title">{title}</Heading>
          {description && <p className="b4-page-header__description">{description}</p>}
        </div>
        {actions && <div className="b4-page-header__actions">{actions}</div>}
      </div>
    </div>
  );
});
