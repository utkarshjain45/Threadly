import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { getUserOrders, createPaymentOrder, verifyPayment, type OrderHistoryResponse } from "@/api/apis";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Package, Calendar, Tag, ChevronRight, Loader2, ShoppingBag } from "lucide-react";

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

export default function Orders() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPayingOrderId, setIsPayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view your orders");
      navigate("/signin");
      return;
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUserOrders();
      // Handle response structure wrapper if nested under api return
      const resData = response.data as any;
      const ordersData = resData?.data ?? resData;
      
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load order history");
      toast.error("Could not load your orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePayment = async (orderId: string, amount: number) => {
    try {
      setIsPayingOrderId(orderId);
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsPayingOrderId(null);
        return;
      }

      const paymentRes = await createPaymentOrder({
        orderId,
        amount,
      });

      const paymentData = paymentRes.data;

      const options = {
        key: paymentData.keyId,
        amount: Math.round(paymentData.amount * 100),
        currency: paymentData.currency || "INR",
        name: "Threadly",
        description: `Complete Payment for Order #${orderId.substring(0, 8)}`,
        order_id: paymentData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment...", { id: "payment-verify" });
            const verifyRes = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderId,
              cartItemIds: [],
            });

            if (verifyRes.data && verifyRes.data.status === "SUCCESS") {
              toast.success("Payment verified successfully!", { id: "payment-verify" });
              fetchOrders();
            } else {
              toast.error(verifyRes.data?.message || "Payment verification failed.", { id: "payment-verify" });
            }
          } catch (err) {
            console.error("Verification error", err);
            toast.error("Payment verification failed.", { id: "payment-verify" });
          } finally {
            setIsPayingOrderId(null);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            setIsPayingOrderId(null);
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
      rzp.on("payment.failed", function (res: any) {
        toast.error(`Payment Failed: ${res.error?.description || "Transaction failed"}`);
        setIsPayingOrderId(null);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment process error:", err);
      toast.error(err?.response?.data?.message || "Payment initiation failed. Please try again.");
      setIsPayingOrderId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "PLACED":
      case "SUCCESS":
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CREATED":
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs / Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            My Orders
          </h1>
          <p className="mt-2 text-slate-500">
            View details and tracking status of all your placed orders.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="mt-4 text-slate-500 font-medium">Fetching your order history...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm mt-10">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-900">Unable to load orders</h3>
            <p className="text-slate-500 mt-2 text-sm">{error}</p>
            <Button 
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={fetchOrders}
            >
              Retry Loading
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs mt-6">
            <div className="w-20 h-20 bg-blue-50/70 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">No orders placed yet</h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">
              Looks like you haven't made any orders yet. Discover our collection of high-quality products and place your first order!
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link to="/products">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300"
              >
                {/* Order Header */}
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Order Placed
                      </span>
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Order ID
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-600 mt-1 block select-all break-all" title={order.id}>
                        {order.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Total Amount
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-1 block">
                        ₹{formatPrice(order.totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Status
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1 ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus === "CREATED" ? "PENDING PAYMENT" : order.orderStatus}
                      </span>
                    </div>
                  </div>
                  {order.orderStatus === "CREATED" && (
                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg shadow-xs flex items-center gap-1.5"
                        onClick={() => handleCompletePayment(order.id, order.totalAmount)}
                        disabled={isPayingOrderId !== null}
                      >
                        {isPayingOrderId === order.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Pay Now"
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="divide-y divide-slate-100">
                  {order.items && order.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-16 w-16 rounded-lg border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                          <img 
                            src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder.png"} 
                            alt={item.productName} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-1">
                            {item.productName}
                          </h4>
                          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5 text-slate-400" />
                              Qty: <strong className="text-slate-700">{item.quantity}</strong>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>
                              Price: <strong className="text-slate-700">₹{formatPrice(item.price)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div className="text-right font-bold text-slate-900 text-base">
                          ₹{formatPrice(item.price * item.quantity)}
                        </div>
                        <Link 
                          to={`/products`} // Can link to a specific product if route is configured
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 mt-1"
                        >
                          Buy Again <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
