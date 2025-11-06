// File: src/context/AuthContext.tsx
export type Person = {
  id: string;
  name: string;
  number: string;
}

export type User = {
  id: string;
  username: string;
  persons: Person[];
}

export type AuthContextType = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}