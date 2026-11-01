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
  githubProfileUrl?: string;
  avatarUrl: string;
  linkedinUrl?: string;
  linkedinUsername?: string;
  role: "MEMBER" | "MAINTAINER" | "LEAD" | string;
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
    userOrStudent: AuthenticatedStudentUser | VerifiedStudent,
    legacyGithubUsername?: string,
    legacyStats?: AuthenticatedStudentUser["stats"]
  ) => void;
  logout: () => void;
  rememberedAccounts: { usn: string; name: string; githubUsername: string; linkedinUsername?: string }[];
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "zenithen_student_session";
const REMEMBERED_KEY = "zenithen_remembered_students";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthenticatedStudentUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [rememberedAccounts, setRememberedAccounts] = React.useState<
    { usn: string; name: string; githubUsername: string; linkedinUsername?: string }[]
  >([]);

  // Restore session and remembered accounts on client mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
      const remembered = localStorage.getItem(REMEMBERED_KEY);
      if (remembered) {
        setRememberedAccounts(JSON.parse(remembered));
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
      if (e.key === REMEMBERED_KEY && e.newValue) {
        try {
          setRememberedAccounts(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const loginUser = (
    userOrStudent: AuthenticatedStudentUser | VerifiedStudent,
    legacyGithubUsername?: string,
    legacyStats?: AuthenticatedStudentUser["stats"]
  ) => {
    let newUser: AuthenticatedStudentUser;

    if ("githubUsername" in userOrStudent && typeof userOrStudent.githubUsername === "string") {
      newUser = userOrStudent as AuthenticatedStudentUser;
    } else {
      const student = userOrStudent as VerifiedStudent;
      const cleanUsername = (legacyGithubUsername || "contributor").replace("@", "").trim();
      newUser = {
        usn: student.usn,
        name: student.name,
        department: student.department,
        year: student.year,
        college: student.college,
        githubUsername: cleanUsername,
        githubProfileUrl: `https://github.com/${cleanUsername}`,
        avatarUrl: `https://github.com/${cleanUsername}.png`,
        linkedinUrl: `https://www.linkedin.com/in/${cleanUsername}`,
        linkedinUsername: cleanUsername,
        role: "MEMBER",
        loggedInAt: new Date().toISOString(),
        stats: legacyStats,
      };
    }

    setUser(newUser);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

      // Remember linked student for fast 1-click return
      const updatedList = [
        {
          usn: newUser.usn,
          name: newUser.name,
          githubUsername: newUser.githubUsername,
          linkedinUsername: newUser.linkedinUsername,
        },
        ...rememberedAccounts.filter((a) => a.usn !== newUser.usn && a.githubUsername !== newUser.githubUsername),
      ].slice(0, 5);

      setRememberedAccounts(updatedList);
      localStorage.setItem(REMEMBERED_KEY, JSON.stringify(updatedList));
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
        rememberedAccounts,
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
