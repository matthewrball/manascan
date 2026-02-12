"use client";

const categories = [
  { value: "", label: "All" },
  { value: "beverages", label: "Beverages" },
  { value: "snacks", label: "Snacks" },
  { value: "dairy", label: "Dairy" },
  { value: "cereals", label: "Cereals" },
  { value: "sauces", label: "Sauces" },
  { value: "frozen", label: "Frozen" },
  { value: "bakery", label: "Bakery" },
];

export default function CategoryFilter({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
            selected === cat.value
              ? "glass-tint-clean text-clean"
              : "glass-subtle text-label-tertiary"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
