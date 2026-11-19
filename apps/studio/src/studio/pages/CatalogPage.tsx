import { useEffect, useMemo, useState } from "react";
import { Badge, PageHeader, SearchField } from "@b4/react";
import { STUDIO_FAMILIES, type StudioFamily } from "../catalog.js";
import { storybookComponentUrl } from "../storybook.js";

export function CatalogPage({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const families = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return STUDIO_FAMILIES;
    return STUDIO_FAMILIES.map((family) => ({
      ...family,
      components: family.components.filter(
        (component) => component.name.toLowerCase().includes(needle) || family.title.toLowerCase().includes(needle),
      ),
    })).filter((family) => family.components.length > 0);
  }, [query]);

  return (
    <div>
      <PageHeader
        title="Components"
        description="Every public B4 component, with quality status and a link to its interactive Storybook story."
      />
      <p style={{ maxWidth: "24rem", marginBottom: "var(--b4-space-10)" }}>
        <SearchField
          label="Search components"
          hideLabel
          placeholder="Search by name or family…"
          value={query}
          onValueChange={setQuery}
        />
      </p>
      <div className="b4-studio__catalog-list">
        {families.map((family) => (
          <section key={family.id} className="b4-studio__catalog-family">
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>{family.title}</h2>
            <CatalogGrid family={family} />
          </section>
        ))}
      </div>
    </div>
  );
}

function CatalogGrid({ family }: { family: StudioFamily }) {
  return (
    <div className="b4-studio__catalog-items">
      {family.components.map((component) => (
        <a
          key={component.name}
          className="b4-studio__catalog-item"
          href={storybookComponentUrl(family.storybookFamilySlug, component.storySlug)}
          target="_blank"
          rel="noreferrer"
        >
          <span>{component.name}</span>
          <Badge tone="success">Verified</Badge>
        </a>
      ))}
    </div>
  );
}