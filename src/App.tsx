interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  onSale: boolean;
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
  return (
    <div>
      <h1>Product Catalog</h1>
<p>{initialProducts.length} products</p>
      {initialProducts.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>${product.price}</p>
          <span
  style={{
    color: product.inStock ? "green" : "gray",
  }}
>
  {product.inStock ? "In stock" : "Sold out"}
</span>
        </div>
      ))}
    </div>
  );
}

export default App;