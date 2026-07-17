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