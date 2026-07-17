import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { ShoppingCart, Heart, Tag, Sparkles, Flame } from "lucide-react";
import { addProductToCart } from "@/api/apis";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviews?: number;
  ratingCount?: number;
  badge?: string;
  isNew?: boolean;
  isOnSale?: boolean;
  category?: string;
  subcategory?: string;
  color?: string;
  size?: string;
  bestSeller?: boolean;
  newArrival?: boolean;
  brand?: string;
  description?: string;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  discount: propDiscount,
  image,
  rating,
  reviews,
  ratingCount,
  badge,
  isNew = false,
  isOnSale = false,
  category,
  subcategory,
  color,
  size,
  bestSeller = false,
  newArrival = false,
  brand,
}: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const calculatedDiscount = propDiscount
    ? propDiscount
    : originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const effectiveReviews = reviews ?? ratingCount ?? 0;

  const handleAddToCartClick = () => {
    setQuantity(1);
    setIsDialogOpen(true);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setQuantity(value);
    }
  };

  const handleQuantityIncrement = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  async function handleAddToCart(selectedQuantity: number) {
    if (isAuthenticated) {
      try {
        await addProductToCart({
          productId: id,
          quantity: selectedQuantity,
        });
        toast.success("Item added to cart");
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Failed to add product to cart", error);
        toast.error("Failed to add item to cart");
      }
      return;
    }

    try {
      const STORAGE_KEY = "guestCart";
      const existing = localStorage.getItem(STORAGE_KEY);

      type GuestCartItem = {
        productId: string;
        quantity: number;
        name: string;
        price: number;
        image: string;
      };

      let cart: GuestCartItem[] = [];

      if (existing) {
        try {
          cart = JSON.parse(existing);
          if (!Array.isArray(cart)) {
            cart = [];
          }
        } catch {
          cart = [];
        }
      }

      const index = cart.findIndex((item) => item.productId === id);
      if (index >= 0) {
        cart[index].quantity += selectedQuantity;
      } else {
        cart.push({
          productId: id,
          quantity: selectedQuantity,
          name,
          price,
          image,
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      toast.success("Item added to cart");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to add product to local cart", error);
      toast.error("Failed to add item to cart");
    }
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-200/80 hover:border-blue-300 rounded-xl bg-white">
      <CardHeader className="p-0 relative">
        <div className="relative overflow-hidden aspect-video bg-gray-100">
          <img
            src={image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"}
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {bestSeller && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1 text-xs px-2 py-0.5 font-semibold">
                <Flame className="w-3 h-3 fill-white" /> Best Seller
              </Badge>
            )}
            {(newArrival || isNew) && (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1 text-xs px-2 py-0.5 font-semibold">
                <Sparkles className="w-3 h-3" /> New
              </Badge>
            )}
            {badge && !bestSeller && !(newArrival || isNew) && (
              <Badge variant="destructive" className="shadow-sm text-xs">
                {badge}
              </Badge>
            )}
          </div>

          <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 z-10">
            {(calculatedDiscount > 0 || isOnSale) && (
              <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-md text-xs px-2 py-0.5">
                -{calculatedDiscount}% OFF
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Add to Wishlist"
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm opacity-90 hover:opacity-100 shadow-sm transition-all text-gray-700 hover:text-red-500"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {category && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                <Tag className="w-2.5 h-2.5" /> {category}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {brand && (
            <p className="text-xs font-semibold text-blue-600 tracking-wider uppercase mb-1">
              {brand}
            </p>
          )}

          <CardTitle className="text-base font-semibold mb-1.5 text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {name}
          </CardTitle>

          {/* Subcategory / Color / Size details */}
          {(subcategory || color || size) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-xs text-gray-500">
              {subcategory && (
                <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[11px] font-medium">
                  {subcategory}
                </span>
              )}
              {color && (
                <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-700">
                  {color}
                </span>
              )}
              {size && (
                <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-700">
                  Size: {size}
                </span>
              )}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700 ml-1.5">
              {rating.toFixed(1)}
            </span>
            {effectiveReviews > 0 && (
              <span className="text-xs text-gray-400 ml-1">
                ({effectiveReviews})
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 pt-2 border-t border-gray-100">
          <span className="text-xl font-extrabold text-gray-900">
            ₹{formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCartClick}
          className="w-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm text-white transition-all duration-200"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Quantity</DialogTitle>
            <DialogDescription>
              Choose the quantity for "{name}" to add to your cart.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleQuantityDecrement}
                  disabled={quantity <= 1}
                >
                  <span className="text-lg">-</span>
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleQuantityIncrement}
                  disabled={quantity >= 10}
                >
                  <span className="text-lg">+</span>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => handleAddToCart(quantity)}>
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}