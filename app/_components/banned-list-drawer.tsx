"use client";

import { useState, useMemo } from "react";
import { Drawer } from "vaul";
import { BANNED_INGREDIENTS } from "@/lib/ingredients/banned-list";
import { CATEGORY_META } from "@/lib/ingredients/categories";
import type { IngredientCategory } from "@/types/ingredient";

const severityColor: Record<string, string> = {
  high: "text-flagged",
  medium: "text-caution",
  low: "text-label-tertiary",
};

const severityBg: Record<string, string> = {
  high: "glass-tint-flagged",
  medium: "glass-tint-caution",
  low: "glass-subtle",
};

const allCategories = Object.keys(CATEGORY_META) as IngredientCategory[];

export default function BannedListDrawer() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filtered = useMemo(() => {
    return BANNED_INGREDIENTS.filter((item) => {
      const matchesSearch =
        !search ||
        item.canonicalName.toLowerCase().includes(search.toLowerCase()) ||
        item.aliases.some((a) =>
          a.toLowerCase().includes(search.toLowerCase())
        );
      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass-subtle glass-interactive flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl p-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-primary"
        >
          <path d="M3 22H12M11 6.25204C11.6392 6.08751 12.3094 6 13 6C17.4183 6 21 9.58172 21 14C21 17.3574 18.9318 20.2317 16 21.4185M5.5 13H9.5C9.96466 13 10.197 13 10.3902 13.0384C11.1836 13.1962 11.8038 13.8164 11.9616 14.6098C12 14.803 12 15.0353 12 15.5C12 15.9647 12 16.197 11.9616 16.3902C11.8038 17.1836 11.1836 17.8038 10.3902 17.9616C10.197 18 9.96466 18 9.5 18H5.5C5.03534 18 4.80302 18 4.60982 17.9616C3.81644 17.8038 3.19624 17.1836 3.03843 16.3902C3 16.197 3 15.9647 3 15.5C3 15.0353 3 14.803 3.03843 14.6098C3.19624 13.8164 3.81644 13.1962 4.60982 13.0384C4.80302 13 5.03534 13 5.5 13ZM4 5.5V13H11V5.5C11 3.567 9.433 2 7.5 2C5.567 2 4 3.567 4 5.5Z" />
        </svg>
        <span className="text-sm font-medium text-label-secondary">
          View All Banned Ingredients
        </span>
      </button>

      <Drawer.Root open={open} onOpenChange={setOpen} snapPoints={[1]}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[60] mx-auto h-[95dvh] max-w-lg flex flex-col rounded-t-3xl outline-none bg-background">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-label-tertiary/30" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3">
              <div className="flex items-center justify-between">
                <Drawer.Title className="text-xl font-bold text-label-primary">
                  Banned Ingredients
                </Drawer.Title>
                <span className="text-sm text-label-tertiary">
                  {filtered.length} items
                </span>
              </div>

              {/* Search */}
              <div className="relative mt-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-label-tertiary"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ingredients..."
                  className="glass-subtle w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-label-tertiary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Category filters */}
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    !selectedCategory
                      ? "glass-tint-primary text-primary"
                      : "glass-subtle text-label-tertiary"
                  }`}
                >
                  All
                </button>
                {allCategories.map((cat) => {
                  const meta = CATEGORY_META[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() =>
                        setSelectedCategory(selectedCategory === cat ? "" : cat)
                      }
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        selectedCategory === cat
                          ? "glass-tint-primary text-primary"
                          : "glass-subtle text-label-tertiary"
                      }`}
                    >
                      {meta.icon} {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-5 h-px bg-label-tertiary/10" />

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-10">
              {Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <span className="text-4xl">🔍</span>
                  <p className="text-sm text-label-tertiary">
                    No ingredients match your search
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => {
                  const meta =
                    CATEGORY_META[category as IngredientCategory];
                  return (
                    <div key={category} className="mb-5">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-base">{meta.icon}</span>
                        <h3 className="text-sm font-semibold text-label-primary">
                          {meta.label}
                        </h3>
                        <span className="text-xs text-label-tertiary">
                          ({items.length})
                        </span>
                      </div>
                      <p className="mb-2 text-xs text-label-tertiary">
                        {meta.description}
                      </p>
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <div
                            key={item.canonicalName}
                            className={`${severityBg[item.severity]} rounded-xl px-3.5 py-2.5`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-label-primary">
                                {item.canonicalName}
                              </span>
                              <span
                                className={`text-[10px] font-semibold uppercase tracking-wider ${severityColor[item.severity]}`}
                              >
                                {item.severity}
                              </span>
                            </div>
                            {item.eNumbers && item.eNumbers.length > 0 && (
                              <p className="mt-0.5 text-xs text-label-tertiary">
                                {item.eNumbers.join(", ")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
