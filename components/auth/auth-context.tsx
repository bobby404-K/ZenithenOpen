"use client";

import * as React from "react";
import { VerifiedStudent } from "@/lib/auth/usn-verification";

export interface AuthenticatedStudentUser {
  usn: string;
  name: string;
  department: string;
  year: string;
  college: string;
  githubUsername: string;
  avatarUrl: string;
  role: "MEMBER" | "MENTOR" | "ADMIN";
  loggedInAt: string;
  stats?: {
    totalPrs: number;
    openPrs: number;
    mergedPrs: number;
    closedPrs: number;
    qualityPrs: number;
  };
}

interface AuthContextType {
  user: AuthenticatedStudentUser | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginUser: (
    student: VerifiedStudent,
    githubUsername: string,
    stats?: AuthenticatedStudentUser["stats"]
  ) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "zenithen_student_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthenticatedStudentUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  // Restore session on client mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const loginUser = (
    student: VerifiedStudent,
    githubUsername: string,
    stats?: AuthenticatedStudentUser["stats"]
  ) => {
    const cleanUsername = githubUsername.replace("@", "").trim();
    const newUser: AuthenticatedStudentUser = {
      usn: student.usn,
      name: student.name,
      department: student.department,
      year: student.year,
      college: student.college,
      githubUsername: cleanUsername,
      avatarUrl: `https://github.com/${cleanUsername}.png`,
      role: "MEMBER",
      loggedInAt: new Date().toISOString(),
      stats,
    };

    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Ignore
    }
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
