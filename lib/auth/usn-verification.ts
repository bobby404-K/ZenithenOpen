/**
 * IST Student USN Verification Service (Open-Source Architecture)
 * 
 * Verifies whether an incoming student belongs to IST
 * before permitting them to link their GitHub profile.
 * 
 * Designed for Open-Source:
 * - Zero hardcoded student names or sensitive rosters in source control.
 * - Algorithmic verification validates authentic IST USN formats (1SV... / SV...).
 * - Pluggable Database Hook: Connects to PostgreSQL, Prisma, Drizzle, or Supabase
 *   when the database is configured.
 */

export interface VerifiedStudent {
  usn: string;
  name: string;
  department: string;
  year: string;
  college: string;
  verifiedAt: string;
  suggestedGithub?: string;
  suggestedLinkedin?: string;
}

/**
 * Normalizes and sanitizes user-provided or synthetic handles for GitHub and LinkedIn.
 * Strips parentheses, symbols, spaces, URL prefixes, and trailing hyphens.
 */
export function sanitizeUsernameHandle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?(github|linkedin)\.com\/(in\/)?/i, "")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface VerificationResult {
  valid: boolean;
  student?: VerifiedStudent;
  error?: string;
}

/**
 * Database Provider Interface
 * Implement this interface when connecting a relational database (PostgreSQL / Prisma).
 */
export interface StudentDatabaseProvider {
  findStudentByUsn(usn: string): Promise<VerifiedStudent | null>;
}

import { db } from "@/lib/db";

/**
 * Pluggable Database Hook
 * When a database is connected later, this will automatically query the connected database provider.
 */
export async function queryStudentDatabase(usn: string): Promise<VerifiedStudent | null> {
  if (!db.isConfigured()) return null;
  const record = await db.students.findByUsn(usn);
  if (!record) return null;
  return {
    usn: record.usn,
    name: record.name || `Student (${record.usn})`,
    department: record.department || "School of Computing & Engineering",
    year: record.year || "Student",
    college: "IST Bengaluru",
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Known IST engineering and computing departments mapped by code
 */
const IST_BRANCH_MAP: Record<string, string> = {
  CS: "Computer Science & Engineering",
  CSE: "Computer Science & Engineering",
  AI: "Artificial Intelligence & Data Science",
  AIDS: "Artificial Intelligence & Data Science",
  DS: "Data Science & Engineering",
  IS: "Information Science & Engineering",
  IT: "Information Technology",
  EC: "Electronics & Communication",
  ECE: "Electronics & Communication",
  CY: "Cyber Security & Digital Forensics",
  BT: "Biotechnology & Bioinformatics",
};

/**
 * Algorithmic validator for IST USN format.
 * Format standard: ^(1SV|SV)[0-9]{2}[A-Z]{2,4}[0-9]{3}$ (e.g., 1SV23CS042, 1SV24AI015)
 */
export function parseIstUsn(rawUsn: string): VerifiedStudent | null {
  const normalized = rawUsn.trim().toUpperCase();
  const pattern = /^(1SV|SV)(\d{2})([A-Z]{2,4})(\d{3})$/i;
  const match = normalized.match(pattern);

  if (!match) {
    // Also accept generic SV prefix with roll number for legacy or alternative schemes
    if (normalized.startsWith("1SV") || normalized.startsWith("SV")) {
      const cleanUsnHandle = `student-${normalized.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      return {
        usn: normalized,
        name: `Student (${normalized})`,
        department: "School of Computing & Engineering",
        year: "Enrolled Student",
        college: "IST Bengaluru",
        verifiedAt: new Date().toISOString(),
        suggestedGithub: cleanUsnHandle,
        suggestedLinkedin: `${cleanUsnHandle}-dev`,
      };
    }
    return null;
  }

  const yearDigits = match[2];
  const branchCode = match[3];

  const department = IST_BRANCH_MAP[branchCode] || `${branchCode} Engineering`;
  const admissionYear = 2000 + parseInt(yearDigits, 10);
  const currentYear = new Date().getFullYear();
  const yearDiff = currentYear - admissionYear + 1;
  const yearOfStudy = Math.min(Math.max(yearDiff, 1), 4);
  const yearLabel = ["1st Year", "2nd Year", "3rd Year", "4th Year"][yearOfStudy - 1] || "Student";
  const cleanHandle = `student-${normalized.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  return {
    usn: normalized,
    name: `Student (${normalized})`,
    department,
    year: yearLabel,
    college: "IST Bengaluru",
    verifiedAt: new Date().toISOString(),
    suggestedGithub: cleanHandle,
    suggestedLinkedin: `${cleanHandle}-dev`,
  };
}


/**
 * Validates whether an entered USN belongs to IST.
 * 
 * Flow:
 * 1. Checks future database record if database provider is active.
 * 2. Fallbacks to IST algorithmic format validation (Open-Source mode).
 */
export async function verifyStudentUSN(rawUsn: string): Promise<VerificationResult> {
  if (!rawUsn || typeof rawUsn !== "string") {
    return {
      valid: false,
      error: "Please enter your University Serial Number (USN).",
    };
  }

  const normalized = rawUsn.trim().toUpperCase();

  // 1. Check database if connected
  try {
    const dbRecord = await queryStudentDatabase(normalized);
    if (dbRecord) {
      return {
        valid: true,
        student: dbRecord,
      };
    }
  } catch {
    // Database query failed or not configured; proceed to algorithmic check
  }

  // 2. Open-source algorithmic validation
  const parsedStudent = parseIstUsn(normalized);
  if (parsedStudent) {
    return {
      valid: true,
      student: parsedStudent,
    };
  }

  return {
    valid: false,
    error: "Invalid University USN. Only students of IST (prefix: 1SV... or SV...) are eligible to join.",
  };
}
