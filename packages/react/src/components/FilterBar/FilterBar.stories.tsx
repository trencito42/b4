import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterBar, type ActiveFilter } from "./FilterBar";
import { Select } from "../Select/Select";
import { SearchField } from "../SearchField/SearchField";

const meta: Meta<typeof FilterBar> = {
  title: "Family F — Application Patterns/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [filters, setFilters] = useState<ActiveFilter[]>([
        { id: "status", label: "Status: Active" },
        { id: "owner", label: "Owner: Ada Lovelace" },
      ]);
      return (
        <FilterBar
          activeFilters={filters}
          onRemoveFilter={(id) => setFilters((f) => f.filter((x) => x.id !== id))}
          onClearAll={() => setFilters([])}
        >
          <SearchField label="Search" hideLabel placeholder="Search projects" />
          <Select
            label="Status"
            hideLabel
            placeholder="Status"
            items={[
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ]}
          />
        </FilterBar>
      );
    }
    return <Demo />;
  },
};
