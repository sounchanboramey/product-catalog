import type { PublicProduct } from "./types";

/**
 * Props for a single product card.
 * Uses `PublicProduct` (not the full `Product`) so `internalCode`
 * can never accidentally reach the rendered output.
 */
interface ProductCardProps {
  /** The product to display. `internalCode` is intentionally excluded. */
  product: PublicProduct;
}

/**
 * Renders a single product card.
 * • `product.description?.trim()` — optional chaining guards the undefined case.
 * • `?? "No description available"` — nullish coalescing supplies the fallback.
 */
function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  const stockClass: string = product.inStock ? "in-stock" : "sold-out";
  const stockLabel: string = product.inStock ? "In stock" : "Sold out";

  return (
    <div className="product-card">
      <h3>{product.name}</h3>

      <p className="price">${product.price.toFixed(2)}</p>

      <p>
        <span className={`stock-badge ${stockClass}`}>{stockLabel}</span>
      </p>

      <p className="description">
        {product.description?.trim() ?? "No description available"}
      </p>

      {product.onSale && (
        <span className="sale-badge">🔥 Sale</span>
      )}
    </div>
  );
}

export default ProductCard;