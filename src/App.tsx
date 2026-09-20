import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import ProductCard from "./ProductCard";
import type { Product, ProductFormDraft } from "./types";
import "./App.css";

/**
 * Seed data — notice `internalCode` lives here (full `Product` shape)
 * but is stripped to `PublicProduct` before reaching `<ProductCard>`.
 */
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
  {
    id: 3,
    name: "Mouse",
    price: 29,
    inStock: false,
    onSale: false,
    // `description` intentionally omitted to exercise `?.` + `??` in ProductCard
    internalCode: "MOU-003",
  },
  {
    id: 4,
    name: "Monitor",
    price: 249,
    inStock: true,
    onSale: true,
    description: "A clear and bright 27-inch monitor.",
    internalCode: "MON-004",
  },
];

/**
 * Root application component — the product catalog.
 *
 * State:
 *  - `products: Product[]`      — the authoritative list; typed explicitly so
 *                                  TypeScript rejects any non-Product shape.
 *  - `inStockOnly: boolean`     — filter toggle.
 *  - `formData: ProductFormDraft` — Partial<{name,price}> so fields can be
 *                                   undefined while the user is typing.
 *  - `errors: ProductFormDraft` — reuses the same Partial shape for error msgs.
 */
function App(): React.JSX.Element {
  // useState<Product[]> — explicit generic; hover this in VS Code to confirm tooltip.
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // ProductFormDraft = Partial<{name: string; price: string}>
  const [formData, setFormData] = useState<ProductFormDraft>({
    name: "",
    price: "",
  });

  const [errors, setErrors] = useState<ProductFormDraft>({});

  // Derived — never stored separately, always computed from state.
  const filteredProducts: Product[] = inStockOnly
    ? products.filter((product: Product): boolean => product.inStock)
    : products;

  const saleCount: number = products.filter(
    (product: Product): boolean => product.onSale
  ).length;

  /**
   * Controlled-input handler.
   * `React.ChangeEvent<HTMLInputElement>` is the correct type — hover `e` to verify.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormData((previous: ProductFormDraft): ProductFormDraft => ({
      ...previous,
      [name]: value,
    }));

    // Clear the error for this field as soon as the user edits it.
    setErrors((previous: ProductFormDraft): ProductFormDraft => ({
      ...previous,
      [name]: undefined,
    }));
  };

  /** Returns an error map — empty object means "valid". */
  const validateForm = (): ProductFormDraft => {
    const newErrors: ProductFormDraft = {};

    // `?.trim()` guards the optional field; `!` would be unsafe here.
    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required.";
    }

    if (!formData.price?.trim()) {
      newErrors.price = "Price is required.";
    } else if (Number.isNaN(Number(formData.price))) {
      newErrors.price = "Price must be a number.";
    }

    return newErrors;
  };

  /**
   * Form submission handler.
   * `FormEvent<HTMLFormElement>` — the named import matches `React.FormEvent`.
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const newErrors: ProductFormDraft = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // `?? ""` / `?? 0` — nullish coalescing satisfies strictNullChecks.
    const newProduct: Product = {
      id: Date.now(),
      name: formData.name ?? "",
      price: Number(formData.price ?? 0),
      inStock: true,
      onSale: false,
      description: undefined,
      internalCode: `NEW-${Date.now()}`,
    };

    setProducts((previous: Product[]): Product[] => [...previous, newProduct]);

    setFormData({ name: "", price: "" });
    setErrors({});
  };

  /**
   * Demonstrates a real fetch — open the Network tab to see the request.
   * The URL is intentionally pointed at a public placeholder so you can
   * observe the 404/CORS failure in the Network tab during the debugging exercise.
   */
  const testNetworkRequest = async (): Promise<void> => {
    try {
      const response: Response = await fetch(
        "https://jsonplaceholder.typicode.com/products"
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
      <header className="app-header">
        <h1>Product Catalog</h1>
        <p className="subtitle">
          {products.length} product{products.length !== 1 ? "s" : ""} total
        </p>

        {saleCount > 0 && (
          <p className="sale-counter">
            🔥 {saleCount} product{saleCount !== 1 ? "s" : ""} on sale!
          </p>
        )}
      </header>

      <label className="filter">
        <input
          type="checkbox"
          id="inStockFilter"
          checked={inStockOnly}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setInStockOnly(e.target.checked)
          }
        />
        In stock only
      </label>

      <section className="products">
        <h2>Products</h2>

        {filteredProducts.length === 0 ? (
          <p className="empty-state">No products match the current filter.</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

      <section className="add-product">
        <h2>Add Product</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name ?? ""}
              onChange={handleInputChange}
              placeholder="Enter product name"
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              id="price"
              name="price"
              type="text"
              value={formData.price ?? ""}
              onChange={handleInputChange}
              placeholder="e.g. 49.99"
            />
            {errors.price && <p className="error">{errors.price}</p>}
          </div>

          <button type="submit" id="addProductBtn">
            Add Product
          </button>
        </form>
      </section>

      <div className="network-section">
        <button
          type="button"
          id="testNetworkBtn"
          onClick={testNetworkRequest}
          className="secondary"
        >
          Test Network Request
        </button>
        <p className="hint">
          Open the <strong>Network tab</strong> before clicking to observe the request.
        </p>
      </div>
    </div>
  );
}

export default App;