import { useEffect, useState } from "react";
import { getProductsData } from "@/api/apis";
import Navbar from "@/components/layout/Navbar";
import { ProductCard } from "@/components/ui/product-card";

interface Product {
  id: string;
  brand: string;
  created_at: string;
  description: string;
  images: string[];
  is_featured: boolean;
  name: string;
  price: number;
  rating: number;
  rating_count: number;
  slug: string;
  stock: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getProductsData();

        // Support multiple possible response shapes:
        // - {data: [{...}, ...]}
        // - {data: {products: [{...}, ...]}}
        // - {products: [{...}, ...]}
        const maybeProducts =
          response.data?.data ?? response.data?.products ?? response.data;

        if (Array.isArray(maybeProducts)) {
          setProducts(maybeProducts);
        } else {
          console.warn("Unexpected products response shape", response.data);
          setError("Unexpected products response format");
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Products</h1>
          <p className="text-gray-600">
            Browse our latest products and add your favorites to the cart.
          </p>
        </header>

        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <p className="text-gray-500">Loading products...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex justify-center items-center py-16">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="flex justify-center items-center py-16">
            <p className="text-gray-500">No products available.</p>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.images?.[0] ?? ""}
                rating={product.rating}
                reviews={product.rating_count}
                badge={product.is_featured ? "Featured" : undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}