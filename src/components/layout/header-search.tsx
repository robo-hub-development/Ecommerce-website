"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getSearchSuggestions } from "@/lib/api/search";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SEARCH_MIN_CHARS as MIN_CHARS } from "@/lib/validations/search";

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const term = value.trim();
  const debounced = useDebouncedValue(term, 300);
  const { data, isFetching, isError } = useQuery({
    queryKey: ["search-suggestions", debounced],
    queryFn: ({ signal }) => getSearchSuggestions(debounced, signal),
    enabled: debounced.length >= MIN_CHARS,
  });

  const suggestions = data ?? [];
  const showPanel = open && term.length >= MIN_CHARS;
  const pending = isFetching || debounced !== term;
  const activeId = activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined;

  const goTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") setOpen(false);
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % suggestions.length);
    }
    if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const active = suggestions[activeIndex];
    if (active) return goTo(`/products/${active.slug}`);
    if (term) goTo(`/products?q=${encodeURIComponent(term)}`);
  };

  return (
    <div
      className={cn("relative", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <form role="search" onSubmit={handleSubmit} action="/products">
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search products
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={`${listId}-input`}
          name="q"
          type="search"
          value={value}
          autoComplete="off"
          placeholder="Search robots, drones, sensors..."
          className="h-10 rounded-full bg-muted pl-9"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          onChange={(event) => {
            setValue(event.target.value);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-popover shadow-pop ring-1 ring-foreground/10">
          <ul id={listId} role="listbox" aria-label="Search suggestions" className="p-1">
            {pending &&
              suggestions.length === 0 &&
              Array.from({ length: 3 }, (_, i) => (
                <li key={i} role="presentation" className="flex items-center gap-3 p-2">
                  <Skeleton className="size-10 rounded-md" />
                  <Skeleton className="h-4 w-2/3" />
                </li>
              ))}
            {suggestions.map((item, index) => (
              <li
                key={item.slug}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => goTo(`/products/${item.slug}`)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg p-2",
                  index === activeIndex && "bg-accent",
                )}
              >
                <Image
                  src={item.image}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-md object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.categoryName}
                  </span>
                </span>
                <span className="text-sm font-semibold">{formatPrice(item.price)}</span>
              </li>
            ))}
          </ul>
          {!pending && isError && (
            <p role="alert" className="px-4 py-3 text-sm text-destructive">
              Search is unavailable right now.
            </p>
          )}
          {!pending && !isError && suggestions.length === 0 && (
            <p role="status" className="px-4 py-3 text-sm text-muted-foreground">
              No products found for &ldquo;{term}&rdquo;.
            </p>
          )}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => goTo(`/products?q=${encodeURIComponent(term)}`)}
            className="w-full border-t px-4 py-2.5 text-left text-sm font-medium text-primary hover:bg-muted"
          >
            See all results for &ldquo;{term}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
