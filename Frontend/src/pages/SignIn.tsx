import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      const result = await login({ email, password });
      if (result.status === "pendingVerification") {
        navigate("/signup", {
          state: {
            email: result.email,
            name: result.name,
            showOtp: true,
            message:
              result.message ??
              "Complete your signup by entering the OTP sent to your email.",
          },
        });
        return;
      }

      toast.success("Login successful! Welcome to Threadly");
      navigate("/");
    } catch (error) {
      toast.error("Login failed. Please check your credentials and try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Link to="/signup">
              <Button variant="link">Sign Up</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={handleLogin} type="submit" className="w-full">
            Login
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => {
              const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
              window.location.href = `${baseUrl}/oauth2/authorization/google`;
            }}>
            Continue with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
