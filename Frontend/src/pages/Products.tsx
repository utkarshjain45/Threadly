import { useEffect, useState } from "react";
import { getProductsData } from "@/api/apis";
import Navbar from "@/components/layout/Navbar";
import { ProductCard } from "@/components/ui/product-card";
import type { Product } from "@/types/product";
import { Search, SlidersHorizontal, Sparkles, Flame, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 10;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [onlyBestSellers, setOnlyBestSellers] = useState(false);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getProductsData();
        const maybeProducts =
          response.data?.data ?? response.data?.products ?? response.data;

        if (Array.isArray(maybeProducts)) {
          setProducts(maybeProducts);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError(err.message || "Failed to fetch products from server");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          String(p.category).toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      result = result.filter(
        (p) =>
          String(p.category).toUpperCase() === selectedCategory.toUpperCase() ||
          String(p.category).toUpperCase().replace("_", "-") === selectedCategory.toUpperCase()
      );
    }

    // Best Seller filter
    if (onlyBestSellers) {
      result = result.filter((p) => p.bestSeller);
    }

    // New Arrival filter
    if (onlyNewArrivals) {
      result = result.filter((p) => p.newArrival || p.isFeatured);
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchQuery, selectedCategory, onlyBestSellers, onlyNewArrivals, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setOnlyBestSellers(false);
    setOnlyNewArrivals(false);
    setSortBy("featured");
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Explore All Products
          </h1>
          <p className="text-gray-600 text-base">
            Browse our full catalog with advanced filtering by category, brand, colors, and features.
          </p>
        </header>

        {/* Search and Main Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products, brands, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 rounded-lg text-sm"
              />
            </div>

            {/* Quick Badges Toggles */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setOnlyBestSellers(!onlyBestSellers)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  onlyBestSellers
                    ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Best Sellers
              </button>

              <button
                onClick={() => setOnlyNewArrivals(!onlyNewArrivals)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  onlyNewArrivals
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> New Arrivals
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                <select
                  value={sortBy}
                  aria-label="Sort products by"
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex justify-center items-center py-16">
            <p className="text-red-500 text-sm font-medium">{error}</p>
          </div>
        )}

        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
            <p className="text-gray-500 text-base font-medium">
              No products match your search criteria.
            </p>
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  image={product.images?.[0] ?? ""}
                  rating={product.rating}
                  reviews={product.ratingCount ?? product.rating_count ?? 0}
                  category={String(product.category)}
                  subcategory={product.subcategory}
                  color={product.color}
                  size={product.size}
                  bestSeller={product.bestSeller}
                  newArrival={product.newArrival}
                  brand={product.brand}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200/80 pt-6">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(endIndex, filteredProducts.length)}
                  </span>{" "}
                  of <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3 text-xs font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`h-9 w-9 text-xs font-bold rounded-lg transition-all ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 text-xs font-semibold"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}