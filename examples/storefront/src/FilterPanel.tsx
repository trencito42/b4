import {
  Button,
  Checkbox,
  MultiSelect,
  SearchField,
  Select,
  Slider,
  type MultiSelectItem,
  type SelectItem,
} from "@b4/react";

export interface StoreFilters {
  query: string;
  category: string | null;
  brands: string[];
  price: number[];
  inStockOnly: boolean;
}

export interface FilterPanelProps {
  filters: StoreFilters;
  categories: readonly string[];
  brands: readonly string[];
  onChange: (filters: StoreFilters) => void;
  onClear: () => void;
}

export function FilterPanel({ filters, categories, brands, onChange, onClear }: FilterPanelProps) {
  const categoryItems: SelectItem[] = categories.map((category) => ({
    value: category,
    label: category,
  }));
  const brandItems: MultiSelectItem[] = brands.map((brand) => ({ value: brand, label: brand }));

  function update(patch: Partial<StoreFilters>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <div className="store-filters__body">
      <SearchField
        label="Search products"
        placeholder="Search the catalogue"
        value={filters.query}
        onValueChange={(value) => update({ query: value })}
      />

      <Select
        label="Category"
        items={categoryItems}
        value={filters.category}
        onValueChange={(value) => update({ category: value })}
        placeholder="Every category"
      />

      <MultiSelect
        label="Brand"
        items={brandItems}
        value={filters.brands}
        onValueChange={(value) => update({ brands: value })}
        placeholder="Every brand"
      />

      <Slider
        label="Maximum price"
        min={0}
        max={320}
        step={10}
        value={filters.price}
        onValueChange={(value) => {
          if (Array.isArray(value)) update({ price: value });
        }}
        format={(value) => `£${value}`}
        hint="Drag either handle to narrow the price range."
      />

      <Checkbox
        label="In stock only"
        checked={filters.inStockOnly}
        onCheckedChange={(checked) => update({ inStockOnly: checked })}
      />

      <Button variant="ghost" size="sm" onClick={onClear}>
        Reset filters
      </Button>
    </div>
  );
}
