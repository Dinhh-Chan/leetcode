// Auth service types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpireAt: number;
  refreshExpireAt: number;
}

export interface LoginRequest {
  platform: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  data: AuthTokens;
  success: boolean;
}

export interface UserMeResponse {
  success: boolean;
  data: {
    _id: string;
    username: string;
    password: string;
    ssoId: string | null;
    email: string;
    firstname: string;
    lastname: string;
    fullname: string;
    gender: string | null;
    dob: string | null;
    systemRole: string;
    studentPtitCode: string | null;
    dataPartitionCode: string | null;
    avatarUrl?: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  fullname: string;
  gender: string | null;
  dob: string | null;
  systemRole: string;
  studentPtitCode: string | null;
  dataPartitionCode: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthServiceResponse {
  user: User;
  tokens: AuthTokens;
}
