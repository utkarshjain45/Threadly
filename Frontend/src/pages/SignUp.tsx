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
import { signUpInit } from "@/api/apis";

export function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { verifySignup } = useAuth();
  const navigate = useNavigate();

  const handleSignUpInit = async () => {
    try {
      if (!name || !email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      setIsLoading(true);
      await signUpInit({ name, email, password });
      toast.success("OTP sent to your email. Please check your inbox.");
      setShowOtpInput(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send OTP. Please try again.");
      console.error("Signup init error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      if (!otp) {
        toast.error("Please enter the OTP");
        return;
      }

      setIsLoading(true);
      const success = await verifySignup({ email, otp });
      if (success) {
        toast.success("Account created successfully! Welcome to Threadly");
        navigate("/dashboard");
      } else {
        toast.error("Signup verification failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Invalid OTP. Please try again.");
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign up to threadly</CardTitle>
          <CardDescription>
            Enter your name, email below to signup on threadly
          </CardDescription>
          <CardAction>
            <Link to="/signin">
              <Button variant="link">Sign In</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              {!showOtpInput ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      disabled={isLoading}
                      maxLength={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      We've sent an OTP to {email}
                    </p>
                  </div>
                </>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {!showOtpInput ? (
            <>
              <Button 
                onClick={handleSignUpInit} 
                type="button" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Sign Up"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  window.location.href = "http://localhost:8080/oauth2/authorization/google";
                }}>
                Continue with Google
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleOtpVerify} 
                type="button" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp("");
                }}
                disabled={isLoading}
              >
                Back
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
