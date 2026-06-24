const categories = [
  "",
  "Electronics",
  "Books",
  "Clothing",
  "Home",
  "Toys",
  "Sports",
];

export default function CategoryFilter({
  value,
  onChange,
}) {
  return (
    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="border p-2 rounded"
    >
      {categories.map((cat) => (
        <option key={cat} value={cat}>
          {cat || "All Categories"}
        </option>
      ))}
    </select>
  );
}