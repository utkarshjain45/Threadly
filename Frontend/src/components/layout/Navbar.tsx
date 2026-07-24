import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getCart, removeItemFromCart, updateCartItemQuantity, type CartResponse } from "@/api/apis";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ShoppingCart, User, Package, LogOut, Plus, Minus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

type GuestCartItem = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
};

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const loadGuestCart = () => {
    const STORAGE_KEY = "guestCart";
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      try {
        const cart = JSON.parse(existing);
        setGuestCart(Array.isArray(cart) ? cart : []);
      } catch {
        setGuestCart([]);
      }
    } else {
      setGuestCart([]);
    }
  };

  const loadCart = async () => {
    if (!isAuthenticated) {
      loadGuestCart();
      return;
    }
    try {
      setIsCartLoading(true);
      setCartError(null);
      const response = await getCart();
      const resData = response.data as any;
      const cartData = resData?.data ?? resData;

      if (cartData && Array.isArray(cartData.cart)) {
        setCart(cartData);
      } else if (Array.isArray(cartData)) {
        setCart({
          cart: cartData,
          totalAmount: cartData.reduce(
            (acc: number, item: any) => acc + (item.price ?? 0) * (item.quantity ?? 1),
            0
          ),
        });
      } else {
        setCart({ cart: [], totalAmount: 0 });
      }
    } catch (error: any) {
      console.error("Cart API load error:", error);

      const status = error?.response?.status;
      const responseData = error?.response?.data;
      const errorMsg =
        typeof responseData === "string"
          ? responseData
          : responseData?.message ?? responseData?.error ?? error?.message ?? "";

      // Comprehensive checks for "cart not found" / 404 scenarios
      const isCartNotFound =
        status === 404 ||
        status === 204 ||
        String(errorMsg).toLowerCase().includes("not found") ||
        String(errorMsg).toLowerCase().includes("cart not found") ||
        String(errorMsg).toLowerCase().includes("no cart") ||
        String(errorMsg).toLowerCase().includes("empty cart");

      if (isCartNotFound) {
        // Handle gracefully as empty cart
        setCart({ cart: [], totalAmount: 0 });
        setCartError(null);
      } else {
        setCartError("Failed to load cart. Please try again.");
      }
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleCartOpenChange = (open: boolean) => {
    setIsCartOpen(open);
    if (open) {
      loadCart();
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!isAuthenticated) {
      // Handle guest cart
      const STORAGE_KEY = "guestCart";
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        try {
          const cart: GuestCartItem[] = JSON.parse(existing);
          const updatedCart = cart.filter((item) => item.productId !== productId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
          setGuestCart(updatedCart);
          toast.success("Item removed from cart");
        } catch (error) {
          console.error("Failed to remove item from guest cart", error);
          toast.error("Failed to remove item from cart");
        }
      }
      return;
    }

    try {
      await removeItemFromCart(productId);
      toast.success("Item removed from cart");
      loadCart(); // Reload cart to reflect changes
    } catch (error) {
      console.error("Failed to remove item from cart", error);
      toast.error("Failed to remove item from cart");
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    if (!isAuthenticated) {
      // Handle guest cart
      const STORAGE_KEY = "guestCart";
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        try {
          const cart: GuestCartItem[] = JSON.parse(existing);
          const index = cart.findIndex((item) => item.productId === productId);
          if (index >= 0) {
            cart[index].quantity = newQuantity;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
            setGuestCart(cart);
            toast.success("Cart updated");
          }
        } catch (error) {
          console.error("Failed to update guest cart", error);
          toast.error("Failed to update cart item");
        }
      }
      return;
    }

    try {
      await updateCartItemQuantity({
        productId,
        quantity: newQuantity,
      });
      toast.success("Cart updated");
      loadCart(); // Reload cart to reflect changes
    } catch (error) {
      console.error("Failed to update cart item", error);
      toast.error("Failed to update cart item");
    }
  };

  const getGuestCartTotal = () => {
    return guestCart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Threadly
            </Link>
          </div>

          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Link
                    to="/"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600"
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Link
                    to="/products"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600"
                  >
                    Products
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600">
                  Categories
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-3 w-56 space-y-1 bg-white rounded-lg shadow-lg border border-gray-100">
                    <Link
                      to="/categories/electronics"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    >
                      <span>⚡</span> Electronics
                    </Link>
                    <Link
                      to="/categories/fashion"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    >
                      <span>✨</span> Fashion
                    </Link>
                    <Link
                      to="/categories/beauty"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    >
                      <span>🌸</span> Beauty
                    </Link>
                    <Link
                      to="/categories/home-appliances"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    >
                      <span>🏠</span> Home Appliances
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            <Sheet open={isCartOpen} onOpenChange={handleCartOpenChange}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 rounded-full"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
              >
                <SheetHeader className="shrink-0 space-y-0 border-b px-6 pb-4 pt-6">
                  <SheetTitle>My Cart</SheetTitle>
                </SheetHeader>
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
                    {isAuthenticated ? (
                      <>
                        {isCartLoading && (
                          <p className="text-sm text-muted-foreground">
                            Loading your cart...
                          </p>
                        )}
                        {cartError && (
                          <p className="text-sm text-red-500">{cartError}</p>
                        )}
                        {!isCartLoading &&
                          !cartError &&
                          cart &&
                          cart.cart.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              Your cart is empty.
                            </p>
                          )}
                        {!isCartLoading &&
                          !cartError &&
                          cart &&
                          cart.cart.map((cartItem) => (
                            <div
                              key={cartItem.productId}
                              className="flex items-center gap-4 rounded-lg border p-3"
                            >
                              <img
                                src={cartItem.images[0]}
                                alt={cartItem.name}
                                className="h-16 w-16 rounded object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium line-clamp-1">
                                  {cartItem.name}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        cartItem.productId,
                                        cartItem.quantity - 1
                                      )
                                    }
                                    disabled={cartItem.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="min-w-[2rem] text-center text-sm font-medium">
                                    {cartItem.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        cartItem.productId,
                                        cartItem.quantity + 1
                                      )
                                    }
                                    disabled={cartItem.quantity >= 10}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="text-right font-semibold">
                                  ₹{formatPrice(cartItem.price * cartItem.quantity)}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleRemoveItem(cartItem.productId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </>
                    ) : (
                      <>
                        {guestCart.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            Your cart is empty.
                          </p>
                        )}
                        {guestCart.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center gap-4 rounded-lg border p-3"
                          >
                            <input
                              type="checkbox"
                              aria-label={`Select ${item.name}`}
                              className="h-4 w-4 cursor-pointer"
                            />
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 rounded object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium line-clamp-1">
                                {item.name}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="min-w-[2rem] text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.productId,
                                      item.quantity + 1,
                                    )
                                  }
                                  disabled={item.quantity >= 10}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-right font-semibold">
                                ₹{formatPrice(item.price * item.quantity)}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleRemoveItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  {isAuthenticated && cart && (
                    <div className="shrink-0 border-t bg-background px-6 py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="text-lg font-semibold">
                          ₹{formatPrice(cart.totalAmount)}
                        </span>
                      </div>
                      <Link to="/cart" onClick={() => setIsCartOpen(false)} className="block w-full">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          View Full Cart & Checkout
                        </Button>
                      </Link>
                    </div>
                  )}
                  {!isAuthenticated && guestCart.length > 0 && (
                    <div className="shrink-0 border-t bg-background px-6 py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="text-lg font-semibold">
                          ₹{formatPrice(getGuestCartTotal())}
                        </span>
                      </div>
                      <Link to="/cart" onClick={() => setIsCartOpen(false)} className="block w-full">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          View Full Cart & Checkout
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

              </SheetContent>
            </Sheet>
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user?.name || "User"} />
                        <AvatarFallback>
                          {user?.name ? (
                            user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name || "User Account"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || "user@threadly.com"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/cart" className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Cart</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;