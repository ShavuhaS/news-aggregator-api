export interface RegisterData {
  email: string;
  password: string;
  username?: string;
}

export interface GoogleUser {
  googleId: string;
  email: string;
  username: string;
}
