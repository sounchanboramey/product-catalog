import { FormEvent, useState } from "react";
import "./App.css";

interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  onSale: boolean;
}

interface ProductFormData {
  name: string;
  price: string;
}

interface FormErrors {
  name?: string;
  price?: string;
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Laptop",
    price: 899,
    inStock: true,
    onSale: true,
  },
  {
    id: 2,
    name: "Keyboard",
    price: 59,
    inStock: true,
    onSale: false,
  },
  {
    id: 3,
    name: "Mouse",
    price: 29,
    inStock: false,
    onSale: false,
  },
  {
    id: 4,
    name: "Monitor",
    price: 249,
    inStock: true,
    onSale: true,
  },
];

function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [inStockOnly, setInStockOnly] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const filteredProducts = inStockOnly
    ? products.filter((product) => product.inStock)
    : products;

  const saleCount = products.filter((product) => product.onSale).length;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required.";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required.";
    } else if (Number.isNaN(Number(formData.price))) {
      newErrors.price = "Price must be a number.";
    } else if (Number(formData.price) < 0) {
      newErrors.price = "Price cannot be negative.";
    }

    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      name: formData.name.trim(),
      price: Number(formData.price),
      inStock: true,
      onSale: false,
    };

    setProducts((previous) => [...previous, newProduct]);

    setFormData({
      name: "",
      price: "",
    });

    setErrors({});
  };

  return (
    <div className="app">
      <h1>Product Catalog</h1>

      <p>{products.length} products</p>

      {saleCount > 0 && (
        <p className="sale-counter">
          {saleCount} products on sale!
        </p>
      )}

      <label className="filter">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
        />
        In stock only
      </label>

      <section className="products">
        <h2>Products</h2>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <h3>{product.name}</h3>

              <p className="price">${product.price}</p>

              <span
                className={
                  product.inStock
                    ? "stock-badge in-stock"
                    : "stock-badge sold-out"
                }
              >
                {product.inStock ? "In stock" : "Sold out"}
              </span>

              {product.onSale && (
                <span className="sale-badge">Sale</span>
              )}
            </div>
          ))}
        </div>
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
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
            />

            {errors.name && (
              <p className="error">{errors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>

            <input
              id="price"
              name="price"
              type="text"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
            />

            {errors.price && (
              <p className="error">{errors.price}</p>
            )}
          </div>

          <button type="submit">Add Product</button>
        </form>
      </section>
    </div>
  );
}

export default App;