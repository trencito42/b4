/**
 * Sample catalogue for the storefront fixture.
 *
 * Entirely fictional: Orbit Store, its brands and its products are invented
 * placeholder content. No real product, company or brand is referenced.
 */

export type StockState = "in-stock" | "low-stock" | "out-of-stock";

/** Stock is never signalled by colour alone — every state carries a label. */
export const stockMeta: Record<
  StockState,
  { status: "online" | "offline" | "degraded" | "idle"; label: string }
> = {
  "in-stock": { status: "online", label: "In stock" },
  "low-stock": { status: "degraded", label: "Low stock" },
  "out-of-stock": { status: "offline", label: "Out of stock" },
};

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  stock: StockState;
  stockCount: number;
  tags: string[];
  description: string;
  highlights: string[];
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export const categories = ["Desk", "Kitchen", "Outdoor", "Audio", "Lighting", "Travel"];

export const brands = [
  "Alder & Co",
  "Kestrel Works",
  "Meridian Lab",
  "Sable Row",
  "Tidewell",
  "Vantage Home",
];

export const products: Product[] = [
  {
    id: "ORB-1041",
    name: "Halo Desk Lamp",
    brand: "Meridian Lab",
    category: "Lighting",
    price: 129,
    compareAtPrice: 159,
    rating: 4.6,
    reviewCount: 212,
    stock: "in-stock",
    stockCount: 48,
    tags: ["bestseller", "new"],
    description:
      "An adjustable task lamp with a warm-to-cool colour range and a matte base that stays put.",
    highlights: ["Stepless dimming", "USB-C passthrough", "Ten-year lamp warranty"],
  },
  {
    id: "ORB-1044",
    name: "Meridian Pour-Over Kettle",
    brand: "Meridian Lab",
    category: "Kitchen",
    price: 84,
    rating: 4.8,
    reviewCount: 388,
    stock: "low-stock",
    stockCount: 6,
    tags: ["bestseller"],
    description:
      "A gooseneck kettle with a variable-flow spout, built for an even drawdown over a single cup.",
    highlights: ["Variable flow spout", "Fits a single cup", "Hand-washable"],
  },
  {
    id: "ORB-1052",
    name: "Kestrel Field Headphones",
    brand: "Kestrel Works",
    category: "Audio",
    price: 219,
    rating: 4.4,
    reviewCount: 96,
    stock: "in-stock",
    stockCount: 21,
    tags: ["new"],
    description:
      "Closed-back wireless headphones with a replaceable earpad and a folding travel frame.",
    highlights: ["Replaceable earpads", "32-hour battery", "Folds flat"],
  },
  {
    id: "ORB-1058",
    name: "Sable Row Weekender Bag",
    brand: "Sable Row",
    category: "Travel",
    price: 176,
    compareAtPrice: 210,
    rating: 4.5,
    reviewCount: 143,
    stock: "in-stock",
    stockCount: 33,
    tags: ["sale"],
    description:
      "A waxed-canvas weekender with a separate shoe compartment and a padded laptop sleeve.",
    highlights: ["Waxed canvas", "Fits a 16-inch laptop", "Separate shoe bay"],
  },
  {
    id: "ORB-1063",
    name: "Tidewell Insulated Bottle",
    brand: "Tidewell",
    category: "Outdoor",
    price: 38,
    rating: 4.2,
    reviewCount: 521,
    stock: "in-stock",
    stockCount: 120,
    tags: [],
    description:
      "A double-wall bottle that keeps drinks cold for a day and hot for a night, with a sip lid.",
    highlights: ["Cold for 24 hours", "Leak-tested lid", "BPA free"],
  },
  {
    id: "ORB-1067",
    name: "Alder Standing Desk Converter",
    brand: "Alder & Co",
    category: "Desk",
    price: 298,
    rating: 4.1,
    reviewCount: 74,
    stock: "out-of-stock",
    stockCount: 0,
    tags: ["backorder"],
    description:
      "A gas-spring desk riser that lifts a monitor and keyboard together through a single lever.",
    highlights: ["Gas-spring lift", "Two height presets", "Cable channel"],
  },
  {
    id: "ORB-1071",
    name: "Vantage Cast Iron Skillet",
    brand: "Vantage Home",
    category: "Kitchen",
    price: 64,
    rating: 4.9,
    reviewCount: 902,
    stock: "in-stock",
    stockCount: 76,
    tags: ["bestseller"],
    description:
      "A pre-seasoned skillet that seasons itself with use and tolerates the oven up to 260°C.",
    highlights: ["Oven safe to 260°C", "Pre-seasoned", "Even heat base"],
  },
  {
    id: "ORB-1075",
    name: "Meridian Reading Light",
    brand: "Meridian Lab",
    category: "Lighting",
    price: 42,
    rating: 4.3,
    reviewCount: 188,
    stock: "low-stock",
    stockCount: 4,
    tags: ["new"],
    description:
      "A clip-on reading light with three warmth settings and a timer that dims itself out.",
    highlights: ["Three warmth settings", "Two-hour timer", "Clip-on base"],
  },
  {
    id: "ORB-1080",
    name: "Sable Row Card Wallet",
    brand: "Sable Row",
    category: "Travel",
    price: 32,
    rating: 4.0,
    reviewCount: 64,
    stock: "in-stock",
    stockCount: 90,
    tags: [],
    description:
      "A slim card wallet with a hidden note pocket and a lifetime re-stitch service.",
    highlights: ["Hidden note pocket", "Lifetime re-stitch", "RFID lining"],
  },
  {
    id: "ORB-1084",
    name: "Kestrel Portable Speaker",
    brand: "Kestrel Works",
    category: "Audio",
    price: 118,
    rating: 4.7,
    reviewCount: 311,
    stock: "in-stock",
    stockCount: 58,
    tags: ["bestseller"],
    description:
      "A pocket speaker with a passive radiator for bass you would not expect from its size.",
    highlights: ["Passive bass radiator", "IP67 water resistant", "18-hour battery"],
  },
  {
    id: "ORB-1089",
    name: "Alder Monitor Riser",
    brand: "Alder & Co",
    category: "Desk",
    price: 74,
    compareAtPrice: 89,
    rating: 4.4,
    reviewCount: 132,
    stock: "in-stock",
    stockCount: 41,
    tags: ["sale"],
    description:
      "A solid-oak riser that lifts a monitor to eye level and hides the cables underneath.",
    highlights: ["Solid oak", "Cable channel", "Assembles without tools"],
  },
  {
    id: "ORB-1093",
    name: "Tidewell Camp Cookset",
    brand: "Tidewell",
    category: "Outdoor",
    price: 58,
    rating: 4.2,
    reviewCount: 87,
    stock: "in-stock",
    stockCount: 64,
    tags: [],
    description:
      "A nesting cookset for two with a folding handle and a windscreen that doubles as a bowl.",
    highlights: ["Nests into itself", "Folding handles", "For two people"],
  },
];

export const faqItems = [
  {
    value: "delivery",
    title: "When will my order arrive?",
    content:
      "Standard delivery takes three to five working days. Express delivery is next working day for orders placed before 14:00.",
  },
  {
    value: "returns",
    title: "What is the returns window?",
    content:
      "Unused items can be returned within thirty days of delivery, in their original packaging.",
  },
  {
    value: "warranty",
    title: "Is there a warranty?",
    content:
      "Every product carries a two-year warranty against manufacturing defects, handled directly by the maker.",
  },
  {
    value: "support",
    title: "How do I reach support?",
    content:
      "Use the help form below and a member of the team replies within one working day.",
  },
];

export const shippingNotes = [
  { id: "n-1", label: "Standard", detail: "3–5 working days", price: "Free over £40" },
  { id: "n-2", label: "Express", detail: "Next working day", price: "£6.95" },
  { id: "n-3", label: "Tracked courier", detail: "2 working days", price: "£12.50" },
];
