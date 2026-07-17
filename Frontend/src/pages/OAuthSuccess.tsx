import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setOAuthSession } = useAuth();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) {
      return;
    }
    hasProcessedRef.current = true;

    const handleOAuth = async () => {
      const token = searchParams.get("token");

      if (!token) {
        toast.error("Google login failed");
        navigate("/signin");
        return;
      }

      await setOAuthSession(token);

      toast.success("Google login successful!");
      navigate("/");
    };

    handleOAuth();
  }, [navigate, searchParams, setOAuthSession]);

  return <div>Signing you in...</div>;
}