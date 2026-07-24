import type { LoginResponse, SignInRequest, SignUpInitResponse, SignUpRequest, SignUpVerifyRequest } from "@/types/auth";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  if (config.url?.startsWith("/api/v1/auth")) {
    return config;
  }

  const userSession = localStorage.getItem("userSession");
  if (userSession) {
    const { token } = JSON.parse(userSession);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const signIn = (signInRequest: SignInRequest) =>
  api.post<LoginResponse>("/api/v1/auth/login", signInRequest);

export const signUp = (signUpRequest: SignUpRequest) =>
  api.post("/api/v1/auth/signup", signUpRequest);

export const signUpInit = (signUpRequest: SignUpRequest) =>
  api.post<SignUpInitResponse>("/api/v1/auth/signup/init", signUpRequest);

export const signUpVerify = (signUpVerifyRequest: SignUpVerifyRequest) =>
  api.post("/api/v1/auth/signup/verify", signUpVerifyRequest);

export const getUserData = () => api.get("/api/v1/users/me");

export const getProductsData = () => api.get("/api/v1/products");

export const getProductsByCategory = (category: string) =>
  api.get(`/api/v1/products/category/${category}`);

export const getBestSellers = () => api.get("/api/v1/products/bestsellers");

export const getNewArrivals = () => api.get("/api/v1/products/new-arrivals");

interface AddToCartRequest{
  productId : string;
  quantity : number;
}

export const addProductToCart = (payload : AddToCartRequest) => 
  api.post("api/v1/cart", payload);

export interface CartItemDTO{
  id: string;
  productId: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  quantity: number;
}

export interface CartResponse{
  cart: CartItemDTO[];
  totalAmount: number;
}

export const getCart = () => api.get<CartResponse>("/api/v1/cart");

export const removeItemFromCart = (productId: string) => 
  api.delete(`api/v1/cart/item/${productId}`);

export const updateCartItemQuantity = (payload: AddToCartRequest) => 
  api.put("api/v1/cart/item", payload);

export interface OrderResponse {
  orderId: string;
  amount: number;
  orderStatus: string;
}

export interface CreatePaymentOrderRequest {
  orderId: string;
  amount: number;
}

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderId: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: string;
  cartItemIds: string[];
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  orderId: string;
}

export const checkoutOrder = (cartItemIds: string[]) =>
  api.post<OrderResponse>("/api/v1/orders/checkout", cartItemIds);

export const createPaymentOrder = (payload: CreatePaymentOrderRequest) =>
  api.post<CreatePaymentOrderResponse>("/api/v1/payments/create-order", payload);

export const verifyPayment = (payload: VerifyPaymentRequest) =>
  api.post<VerifyPaymentResponse>("/api/v1/payments/verify", payload);

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  images: string[];
  price: number;
  quantity: number;
}

export interface OrderHistoryResponse {
  id: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  items: OrderItemDTO[];
}

export const getUserOrders = () =>
  api.get<OrderHistoryResponse[]>("/api/v1/orders");

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  address?: string;
}

export const updateUserProfile = (payload: UserProfileUpdate) =>
  api.put("/api/v1/users/profile", payload);

export interface PasswordUpdateRequest {
  oldPassword?: string;
  newPassword?: string;
}

export const updateUserPassword = (payload: PasswordUpdateRequest) =>
  api.put("/api/v1/users/password", payload);