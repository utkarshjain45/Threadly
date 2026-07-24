import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getCart,
  removeItemFromCart,
  updateCartItemQuantity,
  checkoutOrder,
  createPaymentOrder,
  verifyPayment,
  type CartItemDTO,
} from "@/api/apis";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

type GuestCartItem = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
};

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Cart() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItemDTO[]>([]);
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCartData = async () => {
    if (!isAuthenticated) {
      const STORAGE_KEY = "guestCart";
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        try {
          const items: GuestCartItem[] = JSON.parse(existing);
          setGuestItems(items);
          setSelectedIds(new Set(items.map((i) => i.productId)));
        } catch {
          setGuestItems([]);
        }
      } else {
        setGuestItems([]);
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await getCart();
      const resData = res.data as any;
      const cartData = resData?.data ?? resData;

      let items: CartItemDTO[] = [];
      if (cartData && Array.isArray(cartData.cart)) {
        items = cartData.cart;
      } else if (Array.isArray(cartData)) {
        items = cartData;
      }

      setCartItems(items);
      setSelectedIds(new Set(items.map((item) => item.id)));
    } catch (err: any) {
      console.error("Cart page load error:", err);
      const status = err?.response?.status;
      if (status === 404 || status === 204) {
        setCartItems([]);
      } else {
        setError("Failed to load your cart. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [isAuthenticated]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (isAuthenticated) {
        setSelectedIds(new Set(cartItems.map((item) => item.id)));
      } else {
        setSelectedIds(new Set(guestItems.map((item) => item.productId)));
      }
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const handleUpdateQuantity = async (productId: string, cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, cartItemId);
      return;
    }

    if (!isAuthenticated) {
      const STORAGE_KEY = "guestCart";
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        try {
          const items: GuestCartItem[] = JSON.parse(existing);
          const index = items.findIndex((i) => i.productId === productId);
          if (index >= 0) {
            items[index].quantity = newQuantity;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            setGuestItems(items);
          }
        } catch (e) {
          console.error("Failed updating guest cart item quantity", e);
        }
      }
      return;
    }

    try {
      await updateCartItemQuantity({ productId, quantity: newQuantity });
      setCartItems((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
      );
    } catch (err) {
      toast.error("Failed to update item quantity");
    }
  };

  const handleRemoveItem = async (productId: string, cartItemId: string) => {
    if (!isAuthenticated) {
      const STORAGE_KEY = "guestCart";
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        try {
          const items: GuestCartItem[] = JSON.parse(existing);
          const updated = items.filter((i) => i.productId !== productId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          setGuestItems(updated);
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          toast.success("Item removed from cart");
        } catch (e) {
          console.error("Failed to remove item", e);
        }
      }
      return;
    }

    try {
      await removeItemFromCart(productId);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove item from cart");
    }
  };

  const totalItemsCount = isAuthenticated ? cartItems.length : guestItems.length;
  const isAllSelected = totalItemsCount > 0 && selectedIds.size === totalItemsCount;

  const selectedCartItems = isAuthenticated
    ? cartItems.filter((item) => selectedIds.has(item.id))
    : [];

  const selectedGuestItems = !isAuthenticated
    ? guestItems.filter((item) => selectedIds.has(item.productId))
    : [];

  const calculateSelectedTotal = () => {
    if (isAuthenticated) {
      return selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    } else {
      return selectedGuestItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  };

  const selectedTotal = calculateSelectedTotal();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to complete checkout");
      navigate("/signin");
      return;
    }

    const selectedCartItemIds = Array.from(selectedIds);
    if (selectedCartItemIds.length === 0) {
      toast.error("Please select at least one item to checkout");
      return;
    }

    try {
      setIsCheckoutLoading(true);
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsCheckoutLoading(false);
        return;
      }

      // Step 1: Create Order in Order & Cart Service
      const checkoutRes = await checkoutOrder(selectedCartItemIds);
      const orderData = checkoutRes.data;

      if (!orderData || !orderData.orderId) {
        toast.error("Failed to create order. Please try again.");
        setIsCheckoutLoading(false);
        return;
      }

      // Step 2: Create Payment Order in Payment Service
      const paymentRes = await createPaymentOrder({
        orderId: orderData.orderId,
        amount: orderData.amount,
      });

      const paymentData = paymentRes.data;

      // Step 3: Open Razorpay Modal
      const options = {
        key: paymentData.keyId,
        amount: Math.round(paymentData.amount * 100),
        currency: paymentData.currency || "INR",
        name: "Threadly",
        description: `Order Payment #${orderData.orderId.substring(0, 8)}`,
        order_id: paymentData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment...", { id: "payment-verify" });
            const verifyRes = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderData.orderId,
              cartItemIds: selectedCartItemIds,
            });

            if (verifyRes.data && verifyRes.data.status === "SUCCESS") {
              toast.success("Payment verified! Order placed successfully.", { id: "payment-verify" });
              fetchCartData();
            } else {
              toast.error(verifyRes.data?.message || "Payment verification failed.", { id: "payment-verify" });
            }
          } catch (err) {
            console.error("Verification error", err);
            toast.error("Payment verification failed.", { id: "payment-verify" });
          } finally {
            setIsCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            setIsCheckoutLoading(false);
          },
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment Failed: ${response.error?.description || "Transaction failed"}`);
        setIsCheckoutLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Checkout process error:", err);
      toast.error(err?.response?.data?.message || "Checkout failed. Please try again.");
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Shopping Cart
              {totalItemsCount > 0 && (
                <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select items you want to checkout today
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Continue Shopping
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading cart items...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center my-8">
            <p className="font-semibold">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchCartData}>
              Try Again
            </Button>
          </div>
        ) : totalItemsCount === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center my-6 flex flex-col items-center">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
              Looks like you haven't added any products to your cart yet. Explore our curated collections to find great items!
            </p>
            <Link to="/products">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Item list */}
            <div className="lg:col-span-8 space-y-4">
              {/* Card header with Select All */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-semibold text-slate-700 cursor-pointer select-none"
                  >
                    Select All ({selectedIds.size}/{totalItemsCount} items)
                  </label>
                </div>
                <span className="text-xs text-slate-400">
                  Only checked items will be included in checkout
                </span>
              </div>

              {/* Items list */}
              <div className="space-y-3">
                {isAuthenticated
                  ? cartItems.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border transition-all p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xs ${
                          selectedIds.has(item.id)
                            ? "border-blue-500/50 bg-blue-50/20"
                            : "border-slate-200/80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={selectedIds.has(item.id)}
                            onCheckedChange={() => handleToggleItem(item.id)}
                          />
                          <img
                            src={item.images && item.images.length > 0 ? item.images[0] : ""}
                            alt={item.name}
                            className="h-20 w-20 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-base line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-sm font-bold text-blue-600 mt-1">
                            ₹{formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(item.productId, item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(item.productId, item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= 10}
                              className="p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-right min-w-[5rem]">
                            <p className="text-base font-bold text-slate-900">
                              ₹{formatPrice(item.price * item.quantity)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId, item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  : guestItems.map((item) => (
                      <div
                        key={item.productId}
                        className={`bg-white rounded-xl border transition-all p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xs ${
                          selectedIds.has(item.productId)
                            ? "border-blue-500/50 bg-blue-50/20"
                            : "border-slate-200/80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`guest-${item.productId}`}
                            checked={selectedIds.has(item.productId)}
                            onCheckedChange={() => handleToggleItem(item.productId)}
                          />
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-base line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-sm font-bold text-blue-600 mt-1">
                            ₹{formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(item.productId, "", item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(item.productId, "", item.quantity + 1)
                              }
                              disabled={item.quantity >= 10}
                              className="p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-right min-w-[5rem]">
                            <p className="text-base font-bold text-slate-900">
                              ₹{formatPrice(item.price * item.quantity)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId, "")}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Right side: Order Summary Card */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Selected Items</span>
                    <span className="font-semibold text-slate-800">{selectedIds.size}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">
                      ₹{formatPrice(selectedTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-semibold">Free</span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-bold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-extrabold text-blue-600">
                      ₹{formatPrice(selectedTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={selectedIds.size === 0 || isCheckoutLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing Checkout...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout ({selectedIds.size})
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center text-xs text-slate-500 gap-1.5 pt-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Secured by Razorpay 256-bit SSL Encryption
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
