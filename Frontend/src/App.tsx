import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import { SignIn } from "./pages/SignIn";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import { SignUp } from "./pages/SignUp";
import { Toaster } from "@/components/ui/sonner";
import { OAuthSuccess } from "./pages/OAuthSuccess";
import Products from "./pages/Products";
import CategoryPage from "./pages/CategoryPage";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/categories/:category" element={<CategoryPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
        </Routes>

        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
