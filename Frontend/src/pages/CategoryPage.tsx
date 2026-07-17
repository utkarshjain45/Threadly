import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { ProductCard } from "@/components/ui/product-card";
import { getProductsByCategory } from "@/api/apis";
import type { Product } from "@/types/product";
import { Filter, SlidersHorizontal, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_META: Record<string, { title: string; subtitle: string; bg: string; icon: string }> = {
  electronics: {
    title: "Electronics & Tech",
    subtitle: "Discover cutting-edge gadgets, smart devices, and premium audio equipment.",
    bg: "from-blue-600 to-indigo-700",
    icon: "⚡",
  },
  fashion: {
    title: "Fashion & Apparel",
    subtitle: "Explore modern apparel, footwear, and stylish streetwear collections.",
    bg: "from-purple-600 to-pink-600",
    icon: "✨",
  },
  beauty: {
    title: "Beauty & Personal Care",
    subtitle: "Nourish your skin and elevate your skincare routine with organic cosmetics.",
    bg: "from-rose-500 to-amber-500",
    icon: "🌸",
  },
  "home-appliances": {
    title: "Home Appliances",
    subtitle: "Upgrade your home living with smart cleaning tools and high-efficiency appliances.",
    bg: "from-teal-600 to-emerald-700",
    icon: "🏠",
  },
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("ALL");
  const [selectedColor, setSelectedColor] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("featured");

  const formattedCategory = (category || "").toLowerCase();
  const meta = CATEGORY_META[formattedCategory] || {
    title: category ? category.charAt(0).toUpperCase() + category.slice(1) : "Category",
    subtitle: "Browse premium items in this category",
    bg: "from-slate-700 to-gray-900",
    icon: "🛍️",
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setIsLoading(true);
      try {
        if (!category) return;
        const response = await getProductsByCategory(category);
        const maybeProducts = response.data?.data ?? response.data?.products ?? response.data;

        if (Array.isArray(maybeProducts)) {
          setProducts(maybeProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products for category:", category, err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryProducts();
    setSelectedSubcategory("ALL");
    setSelectedColor("ALL");
  }, [category]);

  // Extract unique subcategories & colors
  const subcategories = Array.from(
    new Set(products.map((p) => p.subcategory).filter((s): s is string => Boolean(s)))
  );
  const colors = Array.from(
    new Set(products.map((p) => p.color).filter((c): c is string => Boolean(c)))
  );

  // Filter & Sort
  useEffect(() => {
    let result = [...products];

    if (selectedSubcategory !== "ALL") {
      result = result.filter((p) => p.subcategory === selectedSubcategory);
    }

    if (selectedColor !== "ALL") {
      result = result.filter((p) => p.color === selectedColor);
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(result);
  }, [products, selectedSubcategory, selectedColor, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      {/* Hero Header Banner */}
      <section className={`bg-gradient-to-r ${meta.bg} text-white py-12 px-4 shadow-inner relative overflow-hidden`}>
        {/* Ambient background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-all bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Products
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-2xl flex items-center justify-center shadow-sm shrink-0">
                {meta.icon}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {meta.title}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-white/90 max-w-2xl font-normal leading-relaxed pt-1">
              {meta.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Category Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mr-2">
              <Filter className="w-4 h-4 text-blue-600" /> Filter:
            </span>

            {/* Subcategory Pills */}
            <button
              onClick={() => setSelectedSubcategory("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubcategory === "ALL"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Types
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSubcategory === sub
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Sort & Color Selector */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {colors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Color:</span>
                <select
                  value={selectedColor}
                  aria-label="Filter by Color"
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="bg-gray-100 border-none text-xs font-semibold text-gray-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Colors</option>
                  {colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={sortBy}
                aria-label="Sort products by"
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-100 border-none text-xs font-semibold text-gray-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> items
            in <span className="font-semibold text-blue-600">{meta.title}</span>
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your filter options or check back soon!
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedSubcategory("ALL");
                setSelectedColor("ALL");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
        )}
      </main>
    </div>
  );
}
