"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Search, MapPin, TrendingUp, ArrowLeft } from "lucide-react"

// ============================================
// TYPES
// ============================================

interface StoreResult {
  storeName: string
  location: string
  price: number
  unit?: string
  inStock?: boolean
  savings?: number
  distance?: string
}

// ============================================
// COMPONENTS
// ============================================

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">Food For Zot</span>
        </a>
        <Button variant="ghost" size="sm" asChild>
          <a href="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </a>
        </Button>
      </div>
    </header>
  )
}

function SearchBar({ onSearch, isLoading }: { onSearch: (query: string) => void; isLoading: boolean }) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl">
      <div className="relative">
        <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter an ingredient (e.g., organic eggs, avocados)..."
          disabled={isLoading}
          className="h-16 w-full rounded-2xl border border-border/50 bg-card pl-16 pr-6 text-base font-medium text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
        />
      </div>
    </form>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Search className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-3 text-2xl font-semibold text-foreground">Find the Best Grocery Prices</h2>
      <p className="max-w-md text-pretty text-muted-foreground">
        Search for any ingredient to compare prices across stores near UCI campus
      </p>
    </div>
  )
}

function ResultCard({ result, isLowestPrice }: { result: StoreResult; isLowestPrice: boolean }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg ${
        isLowestPrice ? "border-primary/50 ring-2 ring-primary/20" : "border-border/50"
      }`}
    >
      {isLowestPrice && (
        <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Best Price
        </div>
      )}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-semibold text-card-foreground">{result.storeName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{result.location}</span>
            {result.distance && (
              <>
                <span>•</span>
                <span>{result.distance}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-semibold text-foreground">${result.price.toFixed(2)}</span>
        {result.unit && <span className="text-base text-muted-foreground">/ {result.unit}</span>}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {result.inStock ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Out of Stock
            </span>
          )}
          {result.savings && result.savings > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
              <TrendingUp className="h-3 w-3" />
              {result.savings}% off
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultsSection({ ingredient, results }: { ingredient: string; results: StoreResult[] }) {
  const lowestPrice = Math.min(...results.map((r) => r.price))

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-10">
        <h2 className="mb-2 text-3xl font-semibold text-foreground">
          Results for <span className="text-primary">{ingredient}</span>
        </h2>
        <p className="text-muted-foreground">Found {results.length} stores • Sorted by best price</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {results.map((result) => (
          <ResultCard key={result.storeName} result={result} isLowestPrice={result.price === lowestPrice} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [results, setResults] = useState<StoreResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setSearchQuery(query)

    try {
      const response = await fetch(`/api/prices?grocery=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error("Failed to fetch prices")
      const data = await response.json()

      const resultsArray: StoreResult[] = Object.entries(data.results).map(([storeName, info]: any) => ({
        storeName,
        location: info.location || "",
        price: info.price,
        unit: info.unit || "",
        inStock: info.inStock ?? true,
        savings: info.savings ?? 0,
        distance: info.distance || "",
      }))

      setResults(resultsArray)
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center">
          <div className="mb-12 w-full max-w-3xl">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-24">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-sm font-medium text-muted-foreground">Searching stores near you...</p>
            </div>
          )}

          {!isLoading && !results && <EmptyState />}
          {!isLoading && results && results.length === 0 && (
            <p className="text-muted-foreground mt-4">No results found for "{searchQuery}".</p>
          )}
          {!isLoading && results && results.length > 0 && <ResultsSection ingredient={searchQuery} results={results} />}
        </div>
      </main>
    </div>
  )
}
