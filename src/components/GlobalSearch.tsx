"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  type: "azure" | "arabic" | "project" | "reminder";
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted hover:text-foreground hover:border-border transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] font-mono text-muted">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60" onClick={() => { setIsOpen(false); setQuery(""); }} />
      <div className="relative w-full max-w-lg mx-4 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Azure topics, Arabic lectures, projects..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
          />
          <button
            onClick={() => { setIsOpen(false); setQuery(""); }}
            className="text-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <p className="text-sm text-muted text-center py-4">Searching...</p>
          )}
          {!loading && query && results.length === 0 && (
            <p className="text-sm text-muted text-center py-4">No results found</p>
          )}
          {!loading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((result, i) => (
                <Link
                  key={i}
                  href={result.href}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-elevated transition-colors"
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    result.type === "azure" && "bg-azure",
                    result.type === "arabic" && "bg-arabic",
                    result.type === "project" && "bg-memorization",
                    result.type === "reminder" && "bg-communication",
                  )} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted truncate">{result.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {!query && (
            <p className="text-sm text-muted text-center py-4">
              Type to search across your mission data
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
