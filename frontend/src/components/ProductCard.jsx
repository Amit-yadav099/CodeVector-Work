export default function ProductCard({ product }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold">
        {product.name}
      </h3>

      <p className="text-gray-600">
        {product.category}
      </p>

      <p className="font-bold mt-2">
        ${product.price}
      </p>

      <p className="text-xs text-gray-500 mt-2">
        Updated:
        {" "}
        {new Date(
          product.updated_at
        ).toLocaleString()}
      </p>
    </div>
  );
}