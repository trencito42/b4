import { Button, Drawer, EmptyState, IconButton, NumberField, Progress } from "@b4/react";
import type { Product } from "./data.js";

export interface CartEntry {
  product: Product;
  quantity: number;
}

export interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: CartEntry[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  freeShippingThreshold: number;
}

const RemoveIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function formatPrice(value: number): string {
  return `£${value.toFixed(2)}`;
}

export function CartDrawer({
  open,
  onOpenChange,
  entries,
  onQuantityChange,
  onRemove,
  onCheckout,
  freeShippingThreshold,
}: CartDrawerProps) {
  const itemCount = entries.reduce((total, entry) => total + entry.quantity, 0);
  const subtotal = entries.reduce(
    (total, entry) => total + entry.product.price * entry.quantity,
    0,
  );
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <Drawer
      title="Your cart"
      description={
        itemCount === 0
          ? "Nothing in the cart yet"
          : `${itemCount} item${itemCount === 1 ? "" : "s"}`
      }
      open={open}
      onOpenChange={onOpenChange}
    >
      {entries.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add something from the catalogue and it will appear here."
          action={
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Browse products
            </Button>
          }
        />
      ) : (
        <div className="store-cart">
          <div className="store-cart__shipping">
            <Progress
              label={
                remaining > 0
                  ? `Spend ${formatPrice(remaining)} more for free shipping`
                  : "Free shipping unlocked"
              }
              hideLabel
              value={shippingProgress}
              showValue={false}
            />
            <p className="store-cart__shipping-text">
              {remaining > 0
                ? `Spend ${formatPrice(remaining)} more for free shipping.`
                : "Free shipping unlocked on this order."}
            </p>
          </div>

          <ul className="store-cart__lines">
            {entries.map((entry) => (
              <li key={entry.product.id} className="store-cart__line">
                <div className="store-cart__line-head">
                  <span className="store-cart__line-name">{entry.product.name}</span>
                  <span className="store-cart__line-price">
                    {formatPrice(entry.product.price * entry.quantity)}
                  </span>
                </div>
                <div className="store-cart__line-actions">
                  <NumberField
                    label={`Quantity for ${entry.product.name}`}
                    hideLabel
                    min={1}
                    max={Math.max(1, entry.product.stockCount)}
                    value={entry.quantity}
                    onValueChange={(value) => {
                      if (value !== null) onQuantityChange(entry.product.id, value);
                    }}
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove ${entry.product.name} from the cart`}
                    icon={RemoveIcon}
                    onClick={() => onRemove(entry.product.id)}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="store-cart__totals">
            <span>Subtotal</span>
            <span className="store-cart__total-value">{formatPrice(subtotal)}</span>
          </div>

          <Button variant="primary" onClick={onCheckout}>
            Checkout
          </Button>
        </div>
      )}
    </Drawer>
  );
}
