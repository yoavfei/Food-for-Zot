"use client"

import { useState } from "react"
import { ShoppingCart, Search, MapPin, TrendingUp, ArrowLeft, Loader2, AlertTriangle } from "lucide-react"

// ============================================
// TYPES
// ============================================

// This interface now maps to the *frontend* display card
interface StoreResult {
  storeName: string
  productName: string
  productUrl: string
  location: string
  price: number
  inStock: boolean
}

// This interface maps to the *backend* API response
interface ApiResponseItem {
  Store: string
  "Product Name": string
  "Product URL": string
  Country: string
  "Price over time": { Date: string, Price: number }[]
  // ... other fields
}

// ============================================
// COMPONENTS
// ============================================

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
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Search className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-3 text-2xl font-semibold text-foreground">Find the Best Grocery Prices</h2>
      <p className="max-w-md text-pretty text-muted-foreground">
        Search for any ingredient to compare prices across stores near UCI campus
      </p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      <h2 className="mb-3 text-2xl font-semibold text-foreground">An Error Occurred</h2>
      <p className="max-w-md text-pretty text-red-600">
        {message}
      </p>
    </div>
  )
}

function ResultCard({ result, isLowestPrice }: { result: StoreResult; isLowestPrice: boolean }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg ${isLowestPrice ? "border-primary/50 ring-2 ring-primary/20" : "border-border/50"
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
            <span>University Town Center, Irvine</span>
          </div>
        </div>
      </div>

      {/* Product name is now on the card */}
      <a
        href={result.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg font-medium text-foreground hover:text-primary transition-colors"
      >
        {result.productName}
      </a>

      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-4xl font-semibold text-foreground">
          ${result.price.toFixed(2)}
        </span>
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
        {/* UPDATED TEXT: */}
        <p className="text-muted-foreground">Found {results.length} prices • Sorted by relevance</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {results.map((result, index) => (
          <ResultCard key={`${result.storeName}-${index}`} result={result} isLowestPrice={result.price === lowestPrice} />
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
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setSearchQuery(query)
    setResults(null)
    setError(null)

    try {
      // --- STEP 1: Get janky, unsorted results from the price API ---
      const priceResponse = await fetch(`${API_URL}/api/prices?grocery=${query}`)
      if (!priceResponse.ok) throw new Error("Failed to fetch prices from the server.")

      const data = await priceResponse.json()

      const resultsArray: StoreResult[] = Object.entries(data.results).flatMap(([storeName, items]: any) => {
        const storeItems: ApiResponseItem[] = Array.isArray(items) ? items : [items]

        return storeItems.flatMap((item: ApiResponseItem) => {
          const priceHistory = item["Price over time"];
          if (!priceHistory || priceHistory.length === 0) return [];

          const latestPriceInfo = priceHistory[priceHistory.length - 1];
          const priceNum = parseFloat(String(latestPriceInfo.Price));

          if (isNaN(priceNum) || priceNum <= 0) return [];

          return [{
            storeName: item.Store || storeName,
            productName: item["Product Name"],
            productUrl: item["Product URL"],
            location: item.Country || "Location N/A",
            price: priceNum,
            inStock: true,
          }];
        });
      });

      // --- STEP 2: Send the janky results to our AI to be ranked ---
      if (resultsArray.length > 0) {
        const rankResponse = await fetch(`${API_URL}/api/prices/rank`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query, results: resultsArray })
        });

        if (!rankResponse.ok) {
          // If ranking fails, just show price-sorted results
          setResults(resultsArray.sort((a, b) => a.price - b.price));
        } else {
          // Set results to the new, AI-sorted list!
          const sortedResults = await rankResponse.json();
          setResults(sortedResults);
        }
      } else {
        setResults([]); // No results found
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || "An unexpected error occurred.")
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full pt-30">
      <main className="h-full container mx-auto px-6 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col h-full items-center">
          <div className="mb-12 w-full max-w-3xl">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Searching stores near you...</p>
            </div>
          )}

          {!isLoading && error && <ErrorState message={error} />}

          {!isLoading && !error && !results && <EmptyState />}

          {!isLoading && !error && results && results.length === 0 && (
            <p className="text-muted-foreground mt-4">No results found for "{searchQuery}".</p>
          )}

          {!isLoading && !error && results && results.length > 0 && (
            <ResultsSection ingredient={searchQuery} results={results} />
          )}
        </div>
      </main>
    </div>
  )
}