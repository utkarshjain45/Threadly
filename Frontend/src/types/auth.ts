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
