"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/authTypes";
import  {jwtDecode} from "jwt-decode";
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isReady: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isReady: false,
  login: () => {},
  logout: () => {},
});

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (token && !isTokenExpired(token)) {
    
    setIsLoggedIn(true);
    if (userData) setUser(JSON.parse(userData));
  } else {
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  }

  setIsReady(true);
  const interval = setInterval(() => {
  console.log("checking token..."); // 👈 add this
  const t = localStorage.getItem("token");
  if (t && isTokenExpired(t)) {
    console.log("token expired, logging out"); // 👈 and this
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  }
}, 5000);
  return () => clearInterval(interval);
}, []);

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
