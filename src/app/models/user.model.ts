export interface UserProfile {
  id: string;
  fullName: string;
  nickName: string;
  birthDate: string | null;
  bio: string;
  avatarUrl: string;
  phoneNumber: string;
  address: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  roles: string[];
  profile: UserProfile;
  isFirstLogin?: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
} 