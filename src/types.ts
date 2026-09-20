/**
 * Full product shape used internally throughout the app.
 * `internalCode` is a warehouse SKU that must never be exposed to end users.
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  onSale: boolean;
  /** Optional marketing blurb shown on the card. */
  description?: string;
  /** Internal warehouse SKU — stripped before sending to the API. */
  internalCode: string;
}

/**
 * Safe public shape — `internalCode` is stripped via `Omit`.
 * Use this type whenever a product is rendered in the UI or sent over the wire.
 * Stays in sync with `Product` automatically: no copy-paste drift.
 */
export type PublicProduct = Omit<Product, "internalCode">;

/**
 * Loose draft for the "Add Product" form.
 * Every field is `string | undefined` so empty inputs are valid while typing.
 * Derive this from `Product` field names — never maintain a parallel list.
 */
export type ProductFormDraft = Partial<{
  name: string;
  price: string;
}>;