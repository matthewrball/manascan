"use client";

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-label-tertiary"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" x2="16.65" y1="21" y2="16.65" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search clean products..."
        className="glass-subtle w-full rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-clean/30 text-label-primary placeholder:text-label-tertiary"
      />
    </div>
  );
}
