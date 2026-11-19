import { forwardRef, type ReactNode } from "react";
import { IconButton } from "../IconButton/IconButton.js";

export interface InspectorProperty {
  id: string;
  label: string;
  value: ReactNode;
}

export interface InspectorSection {
  id: string;
  title?: string;
  properties: InspectorProperty[];
}

export interface InspectorPanelProps {
  title: ReactNode;
  sections: InspectorSection[];
  onClose?: () => void;
  className?: string;
}

const CloseIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

/**
 * A properties panel for a selected item — real `<dl>`/`<dt>`/`<dd>`
 * markup for each label/value pair, not a two-column `<div>` grid
 * standing in for one. Typically the right-hand pane of
 * `ResizablePanels`, inspecting whatever's selected in the main
 * content area.
 */
export const InspectorPanel = forwardRef<HTMLElement, InspectorPanelProps>(function InspectorPanel(
  { title, sections, onClose, className },
  ref,
) {
  return (
    <aside ref={ref} className={["b4-inspector-panel", className ?? ""].filter(Boolean).join(" ")}>
      <div className="b4-inspector-panel__header">
        <p className="b4-inspector-panel__title">{title}</p>
        {onClose && <IconButton variant="ghost" size="sm" aria-label="Close panel" icon={CloseIcon} onClick={onClose} />}
      </div>
      <div className="b4-inspector-panel__body">
        {sections.map((section) => (
          <div key={section.id} className="b4-inspector-panel__section">
            {section.title && <p className="b4-inspector-panel__section-title">{section.title}</p>}
            <dl className="b4-inspector-panel__list">
              {section.properties.map((property) => (
                <div key={property.id} className="b4-inspector-panel__row">
                  <dt className="b4-inspector-panel__label">{property.label}</dt>
                  <dd className="b4-inspector-panel__value">{property.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </aside>
  );
});
