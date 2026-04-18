import { signIn, getUserData, signUp, signUpVerify } from "@/api/apis";
import type { SignInRequest, SignUpRequest, SignUpVerifyRequest } from "@/types/auth";
import type { UserSession } from "@/types/user-session";
import type { User } from "@/types/user";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AuthContextType {
  userSession: UserSession | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  login: (signInRequest: SignInRequest) => Promise<boolean>;
  signup: (signUpRequest: SignUpRequest) => Promise<boolean>;
  verifySignup: (verifyRequest: SignUpVerifyRequest) => Promise<boolean>;
  logout: () => void;
  setOAuthSession: (token: string) => Promise<void>;
}

const getRoleFromToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "user";
  } catch (error) {
    return "user";
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const storedUser = localStorage.getItem("userSession");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data when component mounts if user is already authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (userSession) {
        try {
          const userResponse = await getUserData();
          setUser(userResponse.data);
        } catch (error) {
          console.error("Failed to fetch user data on mount:", error);
        }
      } else {
        setUser(null);
      }
    };

    fetchUserData();
  }, [userSession]);

  const setOAuthSession = async (token: string) => {
    setUserSession({ token });
    localStorage.setItem("userSession", JSON.stringify({ token }));
  };

  const login = async (signInRequest: SignInRequest): Promise<boolean> => {
    try {
      const response = await signIn(signInRequest);
      const { token } = response.data;
      setUserSession({ token });
      localStorage.setItem("userSession", JSON.stringify({ token }));

      return true;
    } catch (error) {
      throw error;
    }
  };
  
  const signup = async (signUpRequest: SignUpRequest): Promise<boolean> => {
    try {
      const response = await signUp(signUpRequest);
      const { token } = response.data;
      setUserSession({ token });
      localStorage.setItem("userSession", JSON.stringify({ token }));

      return true;
    } catch (error) {
      throw error;
    }
  };

  const verifySignup = async (verifyRequest: SignUpVerifyRequest): Promise<boolean> => {
    try {
      const response = await signUpVerify(verifyRequest);
      const { token } = response.data;
      setUserSession({ token });
      localStorage.setItem("userSession", JSON.stringify({ token }));

      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setUserSession(null);
    setUser(null);
    localStorage.removeItem("userSession");
  };

  const value = {
    userSession,
    user  ,
    isAuthenticated: !!userSession,
    isAdmin: userSession
      ? getRoleFromToken(userSession.token) === "ADMIN"
      : false,
    login,
    logout,
    signup,
    verifySignup,
    setOAuthSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
