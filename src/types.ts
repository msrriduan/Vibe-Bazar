// ---------------------------------------------------------------------------
// Vibebazar — Firestore TypeScript type definitions
// All types mirror the JSON Schema constraints in firebase-blueprint.json.
// ---------------------------------------------------------------------------

export interface Product {
  /** URL-safe slug, max 128 chars, matches /^[a-zA-Z0-9_\-\.]+$/. */
  id: string;
  /** Display name, max 150 chars. */
  name: string;
  /** Slug reference to a /categories/{id} document. */
  category: string;
  /** Full product description, max 10 000 chars. */
  description?: string;
  /** Retail price in BDT. Non-negative float, max 1 000 000. */
  price: number;
  /** Inventory count. Non-negative integer, max 100 000. */
  stock: number;
  /** Ordered gallery image URLs, max 10 entries. */
  images: string[];
  /** Whether Cash-on-Delivery is permitted for this product. */
  isCODEnabled: boolean;
  /** Geographic COD scope. */
  codAllowedAreas: 'all' | 'dhaka' | 'none';
  /** If true, promoted on the home page hero section. */
  isFeatured?: boolean;
  /** ISO 8601 UTC creation timestamp. Immutable after first write. */
  createdAt: string;
  /** ISO 8601 UTC last-modified timestamp. */
  updatedAt: string;
}

export interface Category {
  /** URL-safe slug used as Firestore document key. */
  id: string;
  /** Human-readable label shown in navigation, max 100 chars. */
  name: string;
  /** ISO 8601 UTC creation timestamp. Immutable. */
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  /** Product document ID at order time. */
  id: string;
  /** Product name snapshot at order time. */
  name: string;
  /** Unit price in BDT at order time (price-locked). */
  price: number;
  /** Number of units ordered, min 1. */
  quantity: number;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'COD';
export type PaymentStatus = 'Pending' | 'Confirmed';
export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface Order {
  /** Unique reference in VIBE-XXXXXX format (6 uppercase alphanumeric chars). */
  id: string;
  /** Full name of the purchasing customer, max 200 chars. */
  customerName: string;
  /** Bangladeshi mobile number, 11–15 digits. */
  customerPhone: string;
  /** Full delivery address, max 1 000 chars. */
  customerAddress: string;
  /** Ordered line items. At least 1, max 50 entries. */
  items: OrderItem[];
  /** Payment channel. */
  paymentMethod: PaymentMethod;
  /** Payment verification state. Must be 'Pending' on creation. */
  paymentStatus: PaymentStatus;
  /** Mobile banking TrxID (bKash/Nagad/Rocket). Optional for COD. */
  transactionId?: string;
  /** Fulfillment lifecycle state. Must be 'pending' on creation. */
  status: OrderStatus;
  /** Grand total paid in BDT after discounts, max 5 000 000. */
  totalAmount: number;
  /** Promo code applied at checkout (optional). */
  discountCode?: string;
  /** BDT deducted from subtotal (optional, non-negative). */
  discountAmount?: number;
  /** ISO 8601 UTC creation timestamp. Immutable after first write. */
  createdAt: string;
  /** ISO 8601 UTC last-modified timestamp. */
  updatedAt: string;
}

export type DiscountType = 'percentage' | 'flat';

export interface Coupon {
  /** Uppercase alphanumeric promo code used as Firestore document key. */
  code: string;
  /** Whether the discount is a percentage or a flat BDT amount. */
  discountType: DiscountType;
  /** Discount magnitude (percentage 0–100 or flat BDT value). */
  discountValue: number;
  /** Minimum order subtotal in BDT required to redeem. */
  minOrderAmount: number;
  /** If false the coupon is disabled and must be rejected at checkout. */
  isActive: boolean;
  /** ISO 8601 UTC creation timestamp. Immutable. */
  createdAt: string;
}

export interface Admin {
  /** Authorized Google/Firebase email address (also the document key). */
  email: string;
  /** ISO 8601 UTC timestamp of whitelisting. */
  createdAt: string;
}

export interface PaymentNumbers {
  /** Official bKash merchant number. */
  bKash: string;
  /** Official Nagad merchant number. */
  Nagad: string;
  /** Official Rocket merchant number (optional). */
  Rocket?: string;
}

export interface SystemSettings {
  /** Singleton document ID — always 'main'. */
  id: 'main';
  /** Official merchant numbers per payment gateway. */
  paymentNumbers: PaymentNumbers;
  /** WhatsApp contact in international format (e.g. 8801XXXXXXXXX). */
  whatsappNumber: string;
  /** Meta/Facebook Pixel tracking ID (optional). */
  facebookPixelId?: string;
  /** Facebook Messenger chat plugin URL (optional). */
  messengerChatUrl?: string;
  /** ISO 8601 UTC last-modified timestamp. */
  updatedAt: string;
}
