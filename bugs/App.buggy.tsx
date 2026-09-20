/**
 * ⚠️  SABOTAGED COPY — FOR DEBUGGING EXERCISE ONLY ⚠️
 *
 * This file contains THREE deliberate bugs planted by Antigravity (AI).
 * It lives in bugs/ (outside src/) so tsconfig.app.json's "include": ["src"]
 * naturally excludes it — the production build stays clean.
 *
 * DO NOT import this file from anywhere in src/.
 *
 * Bug map:
 *   Bug 1 — CRASH           → useState<Product[] | null>(null) + .map() on null
 *   Bug 2 — SILENT WRONG VALUE → prop name typo `proudct` instead of `product`
 *   Bug 3 — NETWORK FAILURE    → mistyped URL `/apii/productz`
 */

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

// ---------------------------------------------------------------------------
// Minimal inline types (mirrors src/types.ts so this file is self-contained)
// ---------------------------------------------------------------------------

interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  onSale: boolean;
  description?: string;
  internalCode: string;
}

type PublicProduct = Omit<Product, "internalCode">;

type ProductFormDraft = Partial<{
  name: string;
  price: string;
}>;

// ---------------------------------------------------------------------------
// Inline ProductCard (mirrors src/ProductCard.tsx)
// ---------------------------------------------------------------------------

interface ProductCardProps {
  product: PublicProduct;
}

// BUG 2 — SILENT WRONG VALUE ───────────────────────────────────────────────
// The parent passes `proudct={product}` (typo). This component receives
// `product` as `undefined` at runtime — no crash, just blank cards.
// React DevTools Props inspector reveals the misspelled key immediately.
function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  return (
    <div className="product-card">
      {/* product is undefined here — everything renders blank/undefined */}
      <h3>{product?.name}</h3>
      <p className="price">${product?.price}</p>
      <p>{product?.inStock ? "In stock" : "Sold out"}</p>
      <p>{product?.description ?? "No description available"}</p>
      {product?.onSale && <span className="sale-badge">🔥 Sale</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Laptop",
    price: 899,
    inStock: true,
    onSale: true,
    description: "A powerful laptop for everyday work.",
    internalCode: "LAP-001",
  },
  {
    id: 2,
    name: "Keyboard",
    price: 59,
    inStock: true,
    onSale: false,
    description: "A comfortable mechanical keyboard.",
    internalCode: "KEY-002",
  },
];

// ---------------------------------------------------------------------------
// Buggy App component
// ---------------------------------------------------------------------------

function BuggyApp(): React.JSX.Element {
  // BUG 1 — CRASH ────────────────────────────────────────────────────────────
  // Initial state is `null`, not `[]`.
  // The filteredProducts line calls .filter() on null → TypeError at runtime.
  // A breakpoint on `filteredProducts` (or reading the stack trace) immediately
  // shows "Cannot read properties of null (reading 'filter')".
  // FIX: change `null` → `initialProducts` (or guard with `products ?? []`).
  const [products, setProducts] = useState<Product[] | null>(null);

  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const [formData, setFormData] = useState<ProductFormDraft>({
    name: "",
    price: "",
  });

  const [errors, setErrors] = useState<ProductFormDraft>({});

  // 💥 This line crashes: `products` is null, null.filter is not a function.
  const filteredProducts: Product[] = inStockOnly
    ? products!.filter((p: Product): boolean => p.inStock)
    : products!;

  const saleCount: number =
    products?.filter((p: Product): boolean => p.onSale).length ?? 0;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev: ProductFormDraft): ProductFormDraft => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev: ProductFormDraft): ProductFormDraft => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): ProductFormDraft => {
    const newErrors: ProductFormDraft = {};
    if (!formData.name?.trim()) newErrors.name = "Product name is required.";
    if (!formData.price?.trim()) {
      newErrors.price = "Price is required.";
    } else if (Number.isNaN(Number(formData.price))) {
      newErrors.price = "Price must be a number.";
    }
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const newProduct: Product = {
      id: Date.now(),
      name: formData.name ?? "",
      price: Number(formData.price ?? 0),
      inStock: true,
      onSale: false,
      internalCode: `NEW-${Date.now()}`,
    };
    setProducts((prev: Product[] | null): Product[] => [
      ...(prev ?? []),
      newProduct,
    ]);
    setFormData({ name: "", price: "" });
    setErrors({});
  };

  // BUG 3 — NETWORK FAILURE ─────────────────────────────────────────────────
  // URL is mistyped: `/apii/productz` (double-i, trailing-z).
  // The fetch succeeds (HTTP 404 comes back), but `response.ok` is false,
  // so the thrown error surfaces in the console.
  // The Network tab shows the exact URL, status 404, and response body.
  // FIX: correct the path to `/products` (or the real endpoint).
  const testNetworkRequest = async (): Promise<void> => {
    try {
      const response: Response = await fetch(
        "https://jsonplaceholder.typicode.com/apii/productz"  // ← typo
      );
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      console.log("Network request successful");
    } catch (error: unknown) {
      console.error("Network request failed:", error);
    }
  };

  return (
    <div className="app">
      <h1>Product Catalog (BUGGY)</h1>
      <p>{saleCount} on sale</p>

      <label>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setInStockOnly(e.target.checked)
          }
        />
        In stock only
      </label>

      {/* Bug 1 explodes here — filteredProducts is derived from null state */}
      <div className="product-grid">
        {filteredProducts.map((product: Product) => (
          // BUG 2 — prop is `proudct` (typo), not `product`
          // ProductCard receives product=undefined; cards render blank.
          <ProductCard
            key={product.id}
            // @ts-expect-error — intentional prop-name typo for debugging exercise
            proudct={product}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          value={formData.name ?? ""}
          onChange={handleInputChange}
          placeholder="Product name"
        />
        <input
          name="price"
          type="text"
          value={formData.price ?? ""}
          onChange={handleInputChange}
          placeholder="Price"
        />
        {errors.name && <p>{errors.name}</p>}
        {errors.price && <p>{errors.price}</p>}
        <button type="submit">Add</button>
      </form>

      <button type="button" onClick={testNetworkRequest}>
        Test Network (Bug 3)
      </button>
    </div>
  );
}

export default BuggyApp;
