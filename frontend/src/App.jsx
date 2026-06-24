import { useEffect, useState } from "react";

import { getProducts } from "./api/products.js";

import ProductCard from "./components/ProductCard.jsx";
import CategoryFilter from "./components/CategoryFilter.jsx";

function App() {
  const [products, setProducts] = useState([]);

  const [category, setCategory] = useState("");

  const [cursor, setCursor] = useState(null);

  const [snapshot, setSnapshot] = useState(null);

  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);

  async function loadProducts(reset = false) {
    try {
      setLoading(true);

      const data = await getProducts({
        category,
        cursor: reset ? null : cursor,
        snapshot: reset ? null : snapshot,
      });

      if (reset) {
        setProducts(data.products);
      } else {
        setProducts((prev) => [
          ...prev,
          ...data.products,
        ]);
      }

      setCursor(data.nextCursor);
      setSnapshot(data.snapshot);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCursor(null);
    setSnapshot(null);

    loadProducts(true);
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          Product Browser
        </h1>

        <div className="mb-6">
          <CategoryFilter
            value={category}
            onChange={setCategory}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        <div className="flex justify-center mt-8">

          {hasMore && (
            <button
              onClick={() => loadProducts()}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              {loading
                ? "Loading..."
                : "Load More"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default App;