import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Accordion,
  AppShell,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Combobox,
  Dialog,
  DropdownMenu,
  EmptyState,
  HoverCard,
  IconButton,
  InlineAlert,
  KeyboardShortcut,
  Link,
  PageHeader,
  Pagination,
  Popover,
  RadioGroup,
  Sheet,
  Skeleton,
  Spinner,
  StatusBadge,
  Stepper,
  Switch,
  Tabs,
  Textarea,
  TextField,
  ToastProvider,
  ToggleButton,
  Tooltip,
  useToast,
  type DropdownMenuItem,
  type SelectItem,
} from "@b4/react";

import { CartDrawer, type CartEntry } from "./CartDrawer.js";
import { FilterPanel, type StoreFilters } from "./FilterPanel.js";
import { ProductCard } from "./ProductCard.js";
import {
  brands,
  categories,
  faqItems,
  products,
  shippingNotes,
  stockMeta,
  type Product,
} from "./data.js";
import { ThemeToggle, useB4Theme } from "./theme.js";

const PAGE_SIZE = 6;
const FREE_SHIPPING_THRESHOLD = 60;

const productItems: SelectItem[] = products.map((product) => ({
  value: product.id,
  label: product.name,
  description: `${product.brand} · ${product.category}`,
}));

const sortItems: DropdownMenuItem[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest first" },
];

const sortLabels: Record<string, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
  newest: "Newest first",
};

const accountItems: DropdownMenuItem[] = [
  { value: "orders", label: "Orders" },
  { value: "saved", label: "Saved items" },
  { value: "addresses", label: "Addresses" },
  { value: "sign-out", label: "Sign out", destructive: true },
];

const BagIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
  </svg>
);

const HeartIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M12 19.5s-7-4.2-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10.5c0 4.8-7 9-7 9Z" strokeLinejoin="round" />
  </svg>
);

function formatPrice(value: number): string {
  return `£${value.toFixed(2)}`;
}

function sortProducts(list: Product[], sort: string): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => b.id.localeCompare(a.id));
    default:
      return copy;
  }
}

export function App() {
  return (
    <ToastProvider>
      <Storefront />
    </ToastProvider>
  );
}

function Storefront() {
  const { theme, setTheme } = useB4Theme();
  const toast = useToast();

  const [filters, setFilters] = useState<StoreFilters>({
    query: "",
    category: null,
    brands: [],
    price: [0, 320],
    inStockOnly: false,
  });
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [quickView, setQuickView] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterUpdates, setNewsletterUpdates] = useState(true);
  const [newsletterFrequency, setNewsletterFrequency] = useState<"instant" | "daily" | "weekly">(
    "weekly",
  );
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "error" | "success">("idle");
  const [newsletterNotice, setNewsletterNotice] = useState("");
  const [emailFieldError, setEmailFieldError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isRefreshing) return;
    const timer = window.setTimeout(() => setIsRefreshing(false), 700);
    return () => window.clearTimeout(timer);
  }, [isRefreshing]);

  const filtered = useMemo(() => {
    const needle = filters.query.trim().toLowerCase();
    const [minPrice, maxPrice] = filters.price;
    const list = products.filter((product) => {
      if (needle) {
        const haystack = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (filters.category && product.category !== filters.category) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
      if (typeof minPrice === "number" && product.price < minPrice) return false;
      if (typeof maxPrice === "number" && product.price > maxPrice) return false;
      if (filters.inStockOnly && product.stock === "out-of-stock") return false;
      return true;
    });
    return sortProducts(list, sort);
  }, [filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const cartCount = cart.reduce((total, entry) => total + entry.quantity, 0);

  function addToCart(product: Product) {
    setCart((previous) => {
      const existing = previous.find((entry) => entry.product.id === product.id);
      if (!existing) return [...previous, { product, quantity: 1 }];
      return previous.map((entry) =>
        entry.product.id === product.id
          ? { ...entry, quantity: Math.min(entry.quantity + 1, Math.max(1, product.stockCount)) }
          : entry,
      );
    });
    toast.add({
      title: "Added to cart",
      description: product.name,
      type: "success",
    });
  }

  function removeFromCart(productId: string) {
    const removed = cart.find((entry) => entry.product.id === productId);
    setCart((previous) => previous.filter((entry) => entry.product.id !== productId));
    toast.add({
      title: "Removed from cart",
      description: removed ? removed.product.name : "The item was removed.",
      type: "info",
      actionProps: {
        children: "Undo",
        onClick: () => {
          if (!removed) return;
          setCart((previous) => [...previous, removed]);
        },
      },
    });
  }

  function openQuickView(product: Product) {
    setQuickView(product);
    setQuickViewOpen(true);
  }

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newsletterConsent) {
      setNewsletterStatus("error");
      setNewsletterNotice("Please accept the privacy notice before subscribing.");
      setEmailFieldError(undefined);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newsletterEmail.trim())) {
      setNewsletterStatus("error");
      setNewsletterNotice("We could not subscribe you — the email address does not look right.");
      setEmailFieldError("Enter an email address in the form name@example.com.");
      return;
    }
    setNewsletterStatus("success");
    setNewsletterNotice(
      `We will send the ${newsletterFrequency} digest to ${newsletterEmail.trim()}.`,
    );
    setEmailFieldError(undefined);
    toast.add({
      title: "Subscribed",
      description: "Check your inbox to confirm the subscription.",
      type: "success",
    });
  }

  const header = (
    <div className="store-header">
      <div className="store-header__brand">
        <span className="store-header__logo">Orbit</span>
        <nav aria-label="Primary">
          <ul className="store-nav">
            {categories.slice(0, 4).map((category) => (
              <li key={category}>
                <Link href={`#${category.toLowerCase()}`} tone="neutral">
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="store-header__search">
        <Combobox
          label="Search the catalogue"
          hideLabel
          items={productItems}
          placeholder="Search products and brands"
          onValueChange={(value) => {
            const match = products.find((product) => product.id === value);
            if (match) openQuickView(match);
          }}
        />
        <span className="store-header__shortcut" aria-hidden="true">
          <KeyboardShortcut keys={["Ctrl", "K"]} />
        </span>
      </div>

      <div className="store-header__actions">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
        <Tooltip content="Saved items">
          <IconButton variant="ghost" aria-label="Saved items" icon={HeartIcon} />
        </Tooltip>
        <DropdownMenu
          items={accountItems}
          onSelect={(value) =>
            toast.add({ title: "Account", description: `Opened “${value}”.`, type: "info" })
          }
          trigger={
            <IconButton
              variant="ghost"
              aria-label="Account menu"
              icon={<Avatar name="Robin Vale" size="sm" />}
            />
          }
        />
        <Button variant="primary" iconStart={BagIcon} onClick={() => setCartOpen(true)}>
          {`Cart (${cartCount})`}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <AppShell header={header}>
        <div className="store-page">
          <Breadcrumbs
            aria-label="Breadcrumb"
            items={[
              { label: "Home", href: "#home" },
              { label: "Orbit Store" },
            ]}
          />

          <section className="store-hero" aria-labelledby="store-hero-title">
            <Card variant="raised" padding="lg" className="store-hero__card">
              <p className="store-hero__eyebrow">New season</p>
              <h1 id="store-hero-title" className="store-hero__title">
                Everything for a quieter desk
              </h1>
              <p className="store-hero__copy">
                A small, deliberately edited catalogue of desk objects, kitchen tools and
                travel gear — chosen to last rather than to trend.
              </p>
              <ButtonGroup aria-label="Hero actions">
                <Button variant="primary" onClick={() => setSort("featured")}>
                  Shop new arrivals
                </Button>
                <Button variant="secondary" onClick={() => setFiltersOpen(true)}>
                  Refine by category
                </Button>
              </ButtonGroup>
            </Card>
          </section>

          <div className="store-layout">
            <aside className="store-filters" aria-label="Product filters">
              <h2 className="store-section-title">Filters</h2>
              <FilterPanel
                filters={filters}
                categories={categories}
                brands={brands}
                onChange={(next) => {
                  setFilters(next);
                  setPage(1);
                }}
                onClear={() => {
                  setFilters({
                    query: "",
                    category: null,
                    brands: [],
                    price: [0, 320],
                    inStockOnly: false,
                  });
                  setPage(1);
                }}
              />
            </aside>

            <section className="store-results" aria-label="Products">
              <PageHeader
                headingLevel={2}
                title="All products"
                description={`${filtered.length} item${filtered.length === 1 ? "" : "s"} match the current filters.`}
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFiltersOpen(true)}
                    className="store-filters-trigger"
                  >
                    Filters
                  </Button>
                }
              />

              <div className="store-results__bar">
                <div className="store-results__status" role="status">
                  {isRefreshing ? (
                    <Spinner label="Loading products" size="sm" />
                  ) : (
                    <span>{`Showing ${visible.length} of ${filtered.length}`}</span>
                  )}
                </div>

                <ButtonGroup aria-label="Result layout">
                  <ToggleButton
                    size="sm"
                    pressed={view === "grid"}
                    onPressedChange={(pressed) => {
                      if (pressed) setView("grid");
                    }}
                  >
                    Grid
                  </ToggleButton>
                  <ToggleButton
                    size="sm"
                    pressed={view === "list"}
                    onPressedChange={(pressed) => {
                      if (pressed) setView("list");
                    }}
                  >
                    List
                  </ToggleButton>
                </ButtonGroup>

                <DropdownMenu
                  items={sortItems}
                  onSelect={(value) => {
                    setSort(value);
                    setPage(1);
                  }}
                  trigger={
                    <Button variant="secondary" size="sm">
                      {`Sort: ${sortLabels[sort] ?? "Featured"}`}
                    </Button>
                  }
                />
              </div>

              {isRefreshing ? (
                <div className="store-grid" aria-busy="true">
                  {Array.from({ length: PAGE_SIZE }, (_, index) => (
                    <Card key={index} variant="outlined" padding="md" className="store-product">
                      <Skeleton variant="rect" height={120} />
                      <Skeleton variant="text" width="70%" />
                      <Skeleton variant="text" width="40%" />
                    </Card>
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <EmptyState
                  title="Nothing matches those filters"
                  description="Try a wider price range, or clear the category and brand filters."
                  action={
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setFilters({
                          query: "",
                          category: null,
                          brands: [],
                          price: [0, 320],
                          inStockOnly: false,
                        })
                      }
                    >
                      Clear all filters
                    </Button>
                  }
                />
              ) : (
                <div className={`store-grid store-grid--${view}`}>
                  {visible.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpen={openQuickView}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="store-results__pagination">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    aria-label="Product pages"
                  />
                </div>
              )}

              <section className="store-faq" aria-labelledby="store-faq-title">
                <h2 id="store-faq-title" className="store-section-title">
                  Delivery and returns
                </h2>
                <Accordion
                  items={faqItems.map((item) => ({
                    value: item.value,
                    title: item.title,
                    content: <p>{item.content}</p>,
                  }))}
                />
              </section>

              <section className="store-newsletter" aria-labelledby="store-newsletter-title">
                <Card variant="outlined" padding="lg">
                  <h2 id="store-newsletter-title" className="store-section-title">
                    The slow newsletter
                  </h2>
                  <p className="store-newsletter__intro">
                    One short email when something genuinely new arrives. Nothing else, ever.
                  </p>

                  <form className="store-newsletter__form" onSubmit={handleSubscribe} noValidate>
                    <TextField
                      label="Email address"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={newsletterEmail}
                      onValueChange={setNewsletterEmail}
                      error={emailFieldError}
                      hint="We never pass your address to anyone else."
                    />

                    <RadioGroup
                      aria-label="How often should we write?"
                      value={newsletterFrequency}
                      onValueChange={setNewsletterFrequency}
                      items={[
                        { value: "instant", label: "As soon as something lands" },
                        { value: "daily", label: "Once a day" },
                        { value: "weekly", label: "Once a week" },
                      ]}
                    />

                    <Textarea
                      label="Anything we should know?"
                      rows={3}
                      value={newsletterMessage}
                      onChange={(event) => setNewsletterMessage(event.target.value)}
                      hint="Optional — tell us what you are looking for."
                    />

                    <div className="store-newsletter__choices">
                      <Checkbox
                        label="I accept the privacy notice"
                        checked={newsletterConsent}
                        onCheckedChange={setNewsletterConsent}
                      />
                      <Switch
                        label="Also send product updates"
                        checked={newsletterUpdates}
                        onCheckedChange={setNewsletterUpdates}
                      />
                    </div>

                    {newsletterStatus !== "idle" && (
                      <InlineAlert
                        tone={newsletterStatus === "success" ? "success" : "danger"}
                        title={
                          newsletterStatus === "success"
                            ? "You are on the list"
                            : "We could not subscribe you"
                        }
                      >
                        {newsletterNotice}
                      </InlineAlert>
                    )}

                    <Button variant="primary" type="submit">
                      Subscribe
                    </Button>
                  </form>
                </Card>
              </section>
            </section>
          </div>
        </div>
      </AppShell>

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        entries={cart}
        onQuantityChange={(productId, quantity) =>
          setCart((previous) =>
            previous.map((entry) =>
              entry.product.id === productId ? { ...entry, quantity } : entry,
            ),
          )
        }
        onRemove={removeFromCart}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
      />

      <Sheet
        title="Filters"
        description="Refine the catalogue"
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      >
        <FilterPanel
          filters={filters}
          categories={categories}
          brands={brands}
          onChange={setFilters}
          onClear={() =>
            setFilters({
              query: "",
              category: null,
              brands: [],
              price: [0, 320],
              inStockOnly: false,
            })
          }
        />
      </Sheet>

      <Dialog
        title={quickView ? quickView.name : "Product"}
        description={quickView ? `${quickView.brand} · ${quickView.category}` : undefined}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      >
        {quickView && (
          <div className="store-quickview">
            <div className="store-quickview__meta">
              <Badge tone="accent">{quickView.category}</Badge>
              <StatusBadge status={stockMeta[quickView.stock].status}>
                {stockMeta[quickView.stock].label}
              </StatusBadge>
              <HoverCard
                trigger={
                  <Link href="#brand" tone="accent">
                    {quickView.brand}
                  </Link>
                }
              >
                <p>
                  {quickView.brand} makes a small number of considered objects and repairs them
                  rather than replacing them.
                </p>
              </HoverCard>
            </div>

            <div className="store-quickview__price">
              <span className="store-quickview__amount">{formatPrice(quickView.price)}</span>
              <span className="store-quickview__rating">
                {`${quickView.rating.toFixed(1)} out of 5 · ${quickView.reviewCount} reviews`}
              </span>
            </div>

            <Tabs
              aria-label="Product details"
              defaultValue="description"
              items={[
                {
                  value: "description",
                  label: "Description",
                  content: <p>{quickView.description}</p>,
                },
                {
                  value: "highlights",
                  label: "Highlights",
                  content: (
                    <ul className="store-quickview__highlights">
                      {quickView.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  value: "delivery",
                  label: "Delivery",
                  content: (
                    <Popover
                      title="Delivery options"
                      trigger={
                        <Button variant="secondary" size="sm">
                          Compare delivery speeds
                        </Button>
                      }
                    >
                      <ul className="store-shipping">
                        {shippingNotes.map((note) => (
                          <li key={note.id} className="store-shipping__item">
                            <span className="store-shipping__label">{note.label}</span>
                            <span className="store-shipping__detail">{note.detail}</span>
                            <span className="store-shipping__price">{note.price}</span>
                          </li>
                        ))}
                      </ul>
                    </Popover>
                  ),
                },
              ]}
            />

            <div className="store-quickview__actions">
              <Button
                variant="primary"
                disabled={quickView.stock === "out-of-stock"}
                onClick={() => addToCart(quickView)}
              >
                {quickView.stock === "out-of-stock" ? "Sold out" : "Add to cart"}
              </Button>
              <Tooltip content="Save for later">
                <IconButton
                  variant="secondary"
                  aria-label={`Save ${quickView.name} for later`}
                  icon={HeartIcon}
                />
              </Tooltip>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        title="Checkout"
        description="Three short steps, then the order is placed."
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
      >
        <div className="store-checkout">
          <Stepper
            aria-label="Checkout progress"
            orientation="vertical"
            activeStep={1}
            steps={[
              { label: "Contact", description: "Where we send the receipt" },
              { label: "Delivery", description: "Address and speed" },
              { label: "Payment", description: "Card or invoice" },
            ]}
          />

          <TextField
            label="Email address"
            type="email"
            required
            defaultValue="robin.vale@example.com"
            hint="We only use this for the order confirmation."
          />

          <RadioGroup
            aria-label="Delivery speed"
            defaultValue="standard"
            items={[
              { value: "standard", label: "Standard", description: "3–5 working days" },
              { value: "express", label: "Express", description: "Next working day" },
            ]}
          />

          <div className="store-checkout__actions">
            <Button variant="secondary" onClick={() => setCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setCheckoutOpen(false);
                setCart([]);
                toast.add({
                  title: "Order placed",
                  description: "A confirmation is on its way to your inbox.",
                  type: "success",
                });
              }}
            >
              Place order
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
