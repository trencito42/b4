import {
  Badge,
  Button,
  IconButton,
  InteractiveCard,
  StatusBadge,
  Tooltip,
} from "@b4/react";
import { stockMeta, type Product } from "./data.js";

export interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const HeartIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M12 19.5s-7-4.2-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10.5c0 4.8-7 9-7 9Z" strokeLinejoin="round" />
  </svg>
);

function formatPrice(value: number): string {
  return `£${value.toFixed(2)}`;
}

/**
 * A catalogue tile. The whole tile is one `InteractiveCard` (a real button),
 * and the two actions that follow it stay *outside* that button — nesting a
 * button inside a button is invalid HTML and breaks keyboard operation.
 */
export function ProductCard({ product, onOpen, onAddToCart }: ProductCardProps) {
  const stock = stockMeta[product.stock];
  const soldOut = product.stock === "out-of-stock";

  return (
    <article className="store-product">
      <InteractiveCard
        padding="none"
        className="store-product__surface"
        onClick={() => onOpen(product)}
        aria-label={`View details for ${product.name}`}
      >
        <span className="store-product__art" aria-hidden="true">
          <span className="store-product__art-mark">{product.brand.charAt(0)}</span>
        </span>
        <span className="store-product__headline">
          <span className="store-product__name">{product.name}</span>
          <span className="store-product__brand">{product.brand}</span>
        </span>
      </InteractiveCard>

      <div className="store-product__meta">
        {product.tags.includes("sale") && <Badge tone="accent">Reduced</Badge>}
        {product.tags.includes("new") && <Badge tone="info">New</Badge>}
        {product.tags.includes("bestseller") && <Badge tone="success">Bestseller</Badge>}
        <StatusBadge status={stock.status}>{stock.label}</StatusBadge>
      </div>

      <div className="store-product__footer">
        <span className="store-product__price">
          {formatPrice(product.price)}
          {product.compareAtPrice && (
            <span className="store-product__was">{formatPrice(product.compareAtPrice)}</span>
          )}
        </span>
        <div className="store-product__actions">
          <Tooltip content="Save for later">
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={`Save ${product.name} for later`}
              icon={HeartIcon}
            />
          </Tooltip>
          <Button size="sm" disabled={soldOut} onClick={() => onAddToCart(product)}>
            {soldOut ? "Sold out" : "Add to cart"}
          </Button>
        </div>
      </div>
    </article>
  );
}
