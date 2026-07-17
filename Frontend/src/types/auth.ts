export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignUpVerifyRequest {
  email: string;
  otp: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export type SignUpInitResponse = {
  status: "OTP_SENT" | "PENDING_VERIFICATION";
  message: string;
  email: string;
  name?: string;
};

export type LoginResponse = {
  status: "SUCCESS" | "PENDING_VERIFICATION";
  token?: string;
  email?: string;
  name?: string;
  message?: string;
};

export type LoginResult =
  | { status: "success" }
  | {
      status: "pendingVerification";
      email: string;
      name?: string;
      message?: string;
    };
